import { describe, expect, it } from "vitest";
import { getLesson, getWorksheet } from "@/content";
import type { QuestionType } from "@/content/schema";
import { EXAM_MARKS, examBlueprint, readiness } from "@/lib/readiness";
import type { PracticeSession, QuestionAttempt } from "@/lib/store/types";

const NOW = Date.parse("2026-11-20T10:00:00Z");
const daysAgo = (d: number) => new Date(NOW - d * 864e5).toISOString();
const PN = { date: "2026-12-01", lessonIds: ["panchatantra", "nanna-desha"] };

let n = 0;
function session(worksheetId: string, kind: PracticeSession["kind"], ago: number, extra: Partial<PracticeSession> = {}): PracticeSession {
  return {
    id: `s${++n}`, parentId: "p", childId: "c", kind, worksheetId, retryOf: null, status: "graded", markingVersion: "v", help: {},
    awarded: 0, max: 0, startedAt: daysAgo(ago), writingDoneAt: null, completedAt: daysAgo(ago), ...extra,
  };
}
function attempt(s: PracticeSession, questionId: string, type: QuestionType, right: boolean, helpLevel = 0): QuestionAttempt {
  return {
    id: `a${++n}`, sessionId: s.id, parentId: "p", childId: "c", questionId, type, skill: "vocabulary", pageId: null, region: null, text: "x",
    confidence: "high", uncertainWords: [], readingConfirmed: true, misreadFlagged: false, helpLevel, awarded: right ? 1 : 0, max: 1,
    status: right ? "correct" : "incorrect", method: "key", feedback: null, markingVersion: "v", createdAt: s.completedAt!,
  };
}
// A finished worksheet where the first `right` questions are correct (with an optional hint level on every answer).
function sheet(worksheetId: string, ago: number, right: number, helpLevel = 0, minutes?: number) {
  const w = getWorksheet(worksheetId)!;
  const qs = w.sections.flatMap((x) => x.questions);
  const s = session(worksheetId, "worksheet", ago, {
    awarded: Math.min(right, qs.length), max: qs.length,
    help: helpLevel ? Object.fromEntries(qs.map((q) => [q.id, helpLevel])) : {},
    startedAt: daysAgo(ago + (minutes ?? 50) / 1440), completedAt: daysAgo(ago), writingDoneAt: daysAgo(ago),
  });
  return { s, a: qs.map((q, i) => attempt(s, q.id, q.type, i < right, helpLevel)) };
}
// Every card question of one kind from a lesson, all answered right.
function cards(lessonId: string, type: QuestionType, ago: number) {
  const qs = getLesson(lessonId)!.exercises.filter((e) => e.type === type).flatMap((e) => e.questions);
  const s = session(`cards:${lessonId}`, "cards", ago, { awarded: qs.length, max: qs.length });
  return { s, a: qs.map((q) => attempt(s, q.id, type, true)) };
}
const run = (...parts: { s: PracticeSession; a: QuestionAttempt[] }[]) => readiness(parts.flatMap((p) => p.a), parts.map((p) => p.s), PN, NOW);

describe("exam readiness", () => {
  it("uses the real term paper for Panchatantra + Nanna Desha, and always totals 40 marks", () => {
    const test1 = getWorksheet("test-1")!;
    const paper: Record<string, number> = {};
    for (const q of test1.sections.flatMap((x) => x.questions)) paper[q.type] = (paper[q.type] ?? 0) + 1;
    expect(examBlueprint(PN.lessonIds)).toEqual(paper);
    for (const ids of [["kugutide-pakshi"], ["nanna-desha"], ["panchatantra"], []])
      expect(Object.values(examBlueprint(ids)).reduce((t, m) => t + m!, 0)).toBeCloseTo(EXAM_MARKS);
  });

  it("says there isn't enough practice yet when nothing is written", () => {
    const r = run();
    expect(r.enoughEvidence).toBe(false);
    expect(r.daysToGo).toBe(11);
    const cardsOnly = run(cards("panchatantra", "opposite", 1), cards("panchatantra", "plural", 1));
    expect(cardsOnly.enoughEvidence).toBe(false);
  });

  it("never lets tap cards alone show a skill as more than 75% known", () => {
    const sets = Array.from({ length: 12 }, (_, i) => cards("panchatantra", "opposite", i % 3));
    const opposite = run(...sets).types.find((t) => t.type === "opposite")!;
    expect(opposite.mastery).toBeLessThanOrEqual(0.75);
    expect(opposite.mastery).toBeGreaterThan(0.5);
  });

  it("lands close to the real mark when the school paper is replayed", () => {
    // Three recent full papers at 30/40 (the school's own paper among them).
    const r = run(sheet("test-1", 2, 30), sheet("test-2", 5, 30), sheet("test-3", 8, 30));
    expect(r.enoughEvidence).toBe(true);
    expect(r.predicted).toBeGreaterThan(24);
    expect(r.predicted).toBeLessThan(33);
    expect(r.low).toBeLessThanOrEqual(Math.round(r.predicted));
    expect(r.high).toBeGreaterThanOrEqual(Math.round(r.predicted));
  });

  it("gives Exam ready only after a recent timed paper with no hints at 80% or more", () => {
    const strong = [sheet("test-2", 6, 40), sheet("test-3", 9, 40), sheet("panchatantra-practice-a", 3, 25), sheet("nanna-desha-practice-a", 4, 25)];
    const ready = run(sheet("test-1", 1, 39), ...strong);
    expect(ready.level).toBe("ready");
    // The same strong practice, but the last full paper was a month ago: held at "Nearly ready".
    const old = run(sheet("test-1", 30, 39), ...strong.map((x) => ({ ...x, s: { ...x.s, kind: "worksheet" as const, worksheetId: "panchatantra-practice-b" } })));
    expect(old.level).not.toBe("ready");
    // Recent and perfect, but over time: also held back.
    const slow = run(sheet("test-1", 1, 39, 0, 90), ...strong.slice(2));
    expect(slow.level).not.toBe("ready");
  });

  it("counts answers written with hints for less", () => {
    const own = run(sheet("test-1", 2, 36));
    const hinted = run(sheet("test-1", 2, 36, 1));
    expect(hinted.predicted).toBeLessThan(own.predicted);
  });

  it("lets older practice fade and narrows the range as answers add up", () => {
    const recent = run(sheet("panchatantra-practice-a", 1, 25));
    const old = run(sheet("panchatantra-practice-a", 60, 25));
    const meaning = (r: typeof recent) => r.types.find((t) => t.type === "meaning_en")!.mastery;
    expect(meaning(old)).toBeLessThan(meaning(recent));
    const one = run(sheet("test-2", 2, 30));
    const three = run(sheet("test-2", 2, 30), sheet("test-3", 3, 30), sheet("test-1", 4, 30));
    expect(three.high - three.low).toBeLessThan(one.high - one.low);
  });

  it("points to the kinds of question with the most marks still to win", () => {
    const r = run(sheet("test-1", 2, 20));
    expect(r.gains.length).toBeGreaterThan(0);
    expect(r.gains[0].marks).toBeGreaterThanOrEqual(r.gains.at(-1)!.marks);
    for (const g of r.gains) expect(g.href).toMatch(/^\/learn\//);
  });
});

describe("demo family", () => {
  it("Arjun's seeded history lands at Nearly ready with gains to point at", async () => {
    const { arjun, buildFamily } = await import("@/lib/demoData");
    const now = Date.parse("2026-11-20T10:00:00Z");
    const spec = arjun(now);
    const f = buildFamily(spec, now);
    const r = readiness(f.attempts.map((a) => ({ ...a, sessionId: a.sessionKey })), f.sessions.map((s) => ({ ...s, id: s.key, parentId: "p", childId: "c" })), spec.exam, now);
    expect(r.enoughEvidence).toBe(true);
    expect(r.level).toBe("nearly");
    expect(r.gains.length).toBeGreaterThan(0);
    // The same seed always gives the same demo.
    expect(buildFamily(spec, now)).toEqual(f);
  });
});
