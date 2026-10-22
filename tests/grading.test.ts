import { describe, expect, it } from "vitest";
import { gradeAttempts, markDependsOnCheck, type Marker } from "@/lib/grading/grade";
import { recommendation, scoreTrend, skillRows } from "@/lib/dashboard";
import type { PracticeSession, QuestionAttempt } from "@/lib/store/types";

const a = (questionId: string, text: string, max = 1) => ({ questionId, text, max });

describe("gradeAttempts", () => {
  it("marks key answers in code and descriptive answers from the AI's rubric points", async () => {
    const marker: Marker = async (items) => ({
      results: items.map((it) => ({ id: it.id, pointsMet: it.points.map((_, i) => i === 0), feedbackEn: "ok", spellingNotes: [] })),
    });
    const out = await gradeAttempts(
      [
        a("panchatantra.opp.1", "ಸುಖ"),
        a("panchatantra.opp.2", "ಅರ್ಹ"),
        a("nanna-desha.q.3", "ಮಣ್ಣು ಕೆಂಪು", 2), // two rubric points, AI says only the first is met
        a("panchatantra.q.1", ""),
      ],
      marker,
    );
    expect(out.map((o) => [o.status, o.awarded, o.method])).toEqual([
      ["correct", 1, "key"],
      ["incorrect", 0, "key"],
      ["partial", 1, "ai"],
      ["blank", 0, "key"],
    ]);
    expect(out[2].feedback?.points).toHaveLength(2);
  });

  it("never invents a mark when the AI is unavailable or answers badly", async () => {
    const broken: Marker = async () => ({ results: [{ id: "nanna-desha.q.3", pointsMet: [true], feedbackEn: "", spellingNotes: [] }] });
    const [r1] = await gradeAttempts([a("nanna-desha.q.3", "ಕೆಂಪು ಹಸಿರು", 2)], broken);
    expect(r1).toMatchObject({ status: "review", awarded: null });
    const [r2] = await gradeAttempts([a("panchatantra.own.1", "ನಾನು ವಿದ್ಯಾಭ್ಯಾಸ ಮಾಡುತ್ತೇನೆ")], null);
    expect(r2).toMatchObject({ status: "review", awarded: null });
  });

  it("leaves an answer the child flagged as misread for a grown-up, outside the score", async () => {
    const out = await gradeAttempts([{ ...a("panchatantra.opp.1", "ಸುಖ"), misreadFlagged: true }, a("panchatantra.opp.2", "ಅನರ್ಹ")], null);
    expect(out[0]).toMatchObject({ status: "review", awarded: null });
    // Session totals count only answers with a mark (sessionTotals in the pipeline).
    expect(out.filter((x) => x.awarded !== null).map((x) => x.awarded)).toEqual([1]);
  });

  it("notices when a mark depends on the child's choice between unsure readings", () => {
    const unsure = { word: "ಉಳಿ", alternatives: ["ಇಳಿ"], index: 0 };
    expect(markDependsOnCheck({ questionId: "nanna-desha.opp.4", text: "ಇಳಿ", uncertainWords: [unsure], misreadFlagged: false })).toBe(true);
    expect(markDependsOnCheck({ questionId: "nanna-desha.opp.4", text: "ಇಳಿ", uncertainWords: [], misreadFlagged: false })).toBe(false);
  });

  it("caps AI-derived marks at the question maximum", async () => {
    const marker: Marker = async (items) => ({ results: items.map((it) => ({ id: it.id, pointsMet: it.points.map(() => true), feedbackEn: "", spellingNotes: [] })) });
    const [r] = await gradeAttempts([a("panchatantra.q.6", "ಉಪಾಯ ಬಲ್ಲವನಿಗೆ ಅಪಾಯವಿಲ್ಲ", 1)], marker);
    expect(r.awarded).toBe(1);
  });
});

describe("dashboard", () => {
  const base = { sessionId: "s1", parentId: "p", childId: "c", pageId: "pg", region: null, confidence: "high" as const, uncertainWords: [], readingConfirmed: true, misreadFlagged: false, helpLevel: 0, method: "key" as const, feedback: null, markingVersion: "v" };
  const att = (i: number, type: QuestionAttempt["type"], skill: QuestionAttempt["skill"], awarded: number, helpLevel = 0): QuestionAttempt => ({
    ...base, id: `a${i}`, questionId: `q${i}`, type, skill, text: "x", awarded, max: 1, status: awarded ? "correct" : "incorrect", helpLevel, createdAt: new Date(Date.now() - i * 1000).toISOString(),
  });

  it("shows unpractised skills as not started, never as 0%", () => {
    const rows = skillRows([att(1, "opposite", "grammar", 1), att(2, "opposite", "grammar", 0)]);
    expect(rows.find((r) => r.skill === "grammar")).toMatchObject({ attempted: 2, earned: 1, available: 2, pct: 50, status: "recent" });
    expect(rows.find((r) => r.skill === "writing")).toMatchObject({ status: "not_started", pct: null });
  });

  it("recommends only with enough evidence", () => {
    expect(recommendation([att(1, "plural", "grammar", 0), att(2, "plural", "grammar", 0)])).toBeNull();
    const rec = recommendation([0, 0, 0, 1, 1].map((x, i) => att(i, "plural", "grammar", x)));
    expect(rec?.text).toContain("3 of the last 5");
  });

  it("plots first tries only, with independence", () => {
    const s = (id: string, retryOf: string | null, awarded: number, day: number): PracticeSession => ({
      id, parentId: "p", childId: "c", kind: "worksheet", worksheetId: "term-practice-1", retryOf, status: "graded", markingVersion: "v", help: {}, awarded, max: 10, startedAt: "", completedAt: `2026-10-${day}T10:00:00Z`,
    });
    const trend = scoreTrend([s("s2", null, 8, 21), s("s1", null, 5, 20), s("s3", "s1", 9, 22)], [att(1, "plural", "grammar", 1), att(2, "plural", "grammar", 1, 2)]);
    expect(trend.map((t) => [t.sessionId, t.pct])).toEqual([["s1", 50], ["s2", 80]]);
    expect(trend[0].ownPct).toBe(50);
  });
});
