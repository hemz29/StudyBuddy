import { describe, expect, it } from "vitest";
import { LESSONS, getQuestion } from "@/content";
import { hint1, hint2 } from "@/lib/help";
import { gradeAttempts, withHintPenalty } from "@/lib/grading/grade";

describe("hints", () => {
  it("translates the word for an opposite instead of repeating the question", () => {
    const q = LESSONS[0].exercises.find((e) => e.type === "opposite")!.questions.find((x) => x.prompt === "ಲಕ್ಷ್ಯ")!;
    const h = hint1(q).lines.join(" ");
    expect(h).toContain("ಲಕ್ಷ್ಯ");
    expect(h).toMatch(/means “.+”/);
    expect(h).not.toContain(q.answers[0]);
  });

  it("never gives the answer away in Hint 1, for any question", () => {
    for (const l of LESSONS)
      for (const ex of l.exercises)
        for (const q of ex.questions) {
          if (["meaning_kn", "own_sentence", "number_name", "fill_blank"].includes(q.type)) continue;
          const h = hint1(q);
          const text = [...h.lines, h.kn ?? ""].join(" ");
          // (An opposite like ಅಸ್ಪಷ್ಟ → ಸ್ಪಷ್ಟ is inside the question word itself.)
          if (q.answers[0] && q.answers[0].length > 2 && q.type !== "meaning_en" && !q.prompt.includes(q.answers[0]))
            expect(text, q.id).not.toContain(q.answers[0]);
        }
  });

  it("offers 2–4 choices in Hint 2, exactly one of them right", () => {
    for (const l of LESSONS)
      for (const ex of l.exercises)
        for (const q of ex.questions) {
          const h = hint2(q);
          expect(h.options.length, q.id).toBeGreaterThanOrEqual(2);
          expect(h.options.length).toBeLessThanOrEqual(4);
          expect(h.options.filter((o) => o === h.correct).length, q.id).toBe(1);
        }
    expect(hint2(getQuestion("numbers.45")!).options).toContain("ನಲವತ್ತೈದು");
  });

  it("halves the marks for an answer written after Hint 2, and leaves Hint 1 free", async () => {
    expect(withHintPenalty(2, { awarded: 1, feedback: null }).awarded).toBe(0.5);
    expect(withHintPenalty(1, { awarded: 1, feedback: null }).awarded).toBe(1);
    expect(withHintPenalty(2, { awarded: 0, feedback: null }).awarded).toBe(0);
    const graded = await gradeAttempts(
      [
        { questionId: "panchatantra.opp.5", text: "ಅಧೈರ್ಯ", max: 1, helpLevel: 2 },
        { questionId: "panchatantra.opp.5", text: "ಅಧೈರ್ಯ", max: 1, helpLevel: 1 },
      ].slice(0, 1),
      null,
    );
    expect(graded[0].awarded).toBe(0.5);
    expect(graded[0].feedback?.en).toContain("Hint 2");
  });
});
