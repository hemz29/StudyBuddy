import { describe, expect, it } from "vitest";
import { LESSONS, WORKSHEETS, getQuestion, getWorksheet } from "@/content";
import { KEY_GRADED } from "@/content/schema";
import { gradeByKey } from "@/lib/grading/answerKey";
import { transliterate } from "@/lib/transliterate";
import { SCHOOL_WORKSHEET_ANSWERS } from "@/content/grade6/sampleAnswers";

describe("content", () => {
  it("loads three lessons with unique question ids", () => {
    expect(LESSONS.map((l) => l.id)).toEqual(["panchatantra", "nanna-desha", "kugutide-pakshi"]);
    const ids = LESSONS.flatMap((l) => l.exercises.flatMap((e) => e.questions.map((q) => q.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every key-graded question at least one answer and every AI-graded one rubric points", () => {
    for (const l of LESSONS)
      for (const ex of l.exercises)
        for (const q of ex.questions) {
          if (q.type === "who_said") expect(q.speaker?.length && q.listener?.length, q.id).toBeTruthy();
          else if (KEY_GRADED.includes(q.type)) expect(q.answers.length, q.id).toBeGreaterThan(0);
          else expect(q.points?.length, q.id).toBeGreaterThan(0);
        }
  });

  it("builds the term worksheet in the school's section order", () => {
    const ws = getWorksheet("term-practice-1")!;
    expect(ws.sections.map((s) => s.type)).toEqual([
      "meaning_kn", "meaning_en", "en_to_kn", "opposite", "gender", "plural", "split",
      "one_sentence", "who_said", "own_sentence", "number_name", "poem_line", "poet_name",
    ]);
    expect(ws.totalMarks).toBe(53);
    expect(WORKSHEETS.length).toBe(7);
    for (const w of WORKSHEETS) expect(w.sections.length, w.id).toBeGreaterThan(3);
  });
});

describe("answer key grading on the real school worksheet", () => {
  it("covers every term-practice question", () => {
    const ws = getWorksheet("term-practice-1")!;
    const qids = ws.sections.flatMap((s) => s.questions.map((q) => q.id));
    expect(Object.keys(SCHOOL_WORKSHEET_ANSWERS).sort()).toEqual([...qids].sort());
  });

  it("marks the child's key-graded answers as the teacher's key would", () => {
    const results = Object.entries(SCHOOL_WORKSHEET_ANSWERS)
      .map(([id, a]) => [id, getQuestion(id)!, a] as const)
      .filter(([, q]) => KEY_GRADED.includes(q.type))
      .map(([id, q, a]) => [id, gradeByKey(q, a).status] as const);
    const notCorrect = results.filter(([, s]) => s !== "correct");
    // "ಲಕ್ಷ್ಯ/ಗಮನ" (two alternatives written together) is the only answer that needs the AI check.
    expect(notCorrect).toEqual([["panchatantra.ekn.6", "unsure"]]);
  });

  it("gives near-miss spelling feedback and half marks for a half-right who-said", () => {
    const opp = getQuestion("panchatantra.opp.5")!;
    const r = gradeByKey(opp, "ಅದೈರ್ಯ");
    expect(r.status).toBe("incorrect");
    expect(r.nearMiss?.correct).toBe("ಅಧೈರ್ಯ");
    const who = getQuestion("panchatantra.who.3")!;
    expect(gradeByKey(who, "ಈ ಮಾತನ್ನು ಸಿಂಹ ರಾಜನಿಗೆ ಹೇಳಿತು").fraction).toBe(0.5);
    expect(gradeByKey(who, "").status).toBe("blank");
  });
});

describe("transliteration", () => {
  it("uses the documented scheme", () => {
    expect(transliterate("ಪಂಚತಂತ್ರ")).toBe("panchatantra");
    expect(transliterate("ನನ್ನ ದೇಶ ನನ್ನ ಜನ")).toBe("nanna dēsha nanna jana");
    expect(transliterate("ಗುಹೆ")).toBe("guhe");
    expect(transliterate("ಸಿಂಹ")).toBe("sinha");
    expect(transliterate("ದುಃಖ")).toBe("duhkha");
  });
});
