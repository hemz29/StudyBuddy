import type { LessonInput, QuestionType, Skill } from "./schema";

type QuestionInput = LessonInput["exercises"][number]["questions"][number];

// Turn [kn, en] pairs into numbered sentence objects.
export function sentences(prefix: string, pairs: [string, string][]) {
  return pairs.map(([kn, en], i) => ({ id: `${prefix}${i + 1}`, kn, en }));
}

// Build an exercise from compact question definitions; ids become `${id}.${n}`.
export function exercise(
  id: string,
  type: QuestionType,
  skill: Skill,
  instructionKn: string,
  instructionEn: string,
  questions: Omit<QuestionInput, "id" | "type" | "skill">[],
) {
  return {
    id,
    type,
    instructionKn,
    instructionEn,
    questions: questions.map((q, i) => ({ id: `${id}.${i + 1}`, type, skill, ...q })),
  };
}

type Gloss = { word: string; meaningKn: string; meaningEn: string };

const splitAlternatives = (s: string) =>
  s
    .split(/[;,/]/)
    .map((x) => x.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean);

// The three meaning exercises on the school worksheet, generated from the glossary.
export function glossaryExercises(lessonId: string, glossary: Gloss[]) {
  return [
    exercise(
      `${lessonId}.mkn`,
      "meaning_kn",
      "vocabulary",
      "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.",
      "Write the Kannada meaning for the following words.",
      glossary.map((g) => ({
        prompt: g.word,
        answers: splitAlternatives(g.meaningKn),
        model: { kn: g.meaningKn, en: g.meaningEn },
      })),
    ),
    exercise(
      `${lessonId}.men`,
      "meaning_en",
      "vocabulary",
      "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.",
      "Write the English meaning for the following words.",
      glossary.map((g) => ({
        prompt: g.word,
        answers: splitAlternatives(g.meaningEn),
        model: { kn: g.meaningKn, en: g.meaningEn },
      })),
    ),
    exercise(
      `${lessonId}.ekn`,
      "en_to_kn",
      "vocabulary",
      "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.",
      "Write the Kannada word for the following English words.",
      glossary.map((g) => ({
        prompt: splitAlternatives(g.meaningEn)[0],
        answers: [g.word, ...splitAlternatives(g.meaningKn)],
        model: { kn: g.word, en: g.meaningEn },
      })),
    ),
  ];
}

// Rubric for "use the word in your own sentence": the teacher's sentence is only an example.
export function ownSentence(word: string, meaningEn: string, exampleKn: string, exampleEn: string) {
  return {
    prompt: word,
    promptEn: meaningEn,
    model: { kn: exampleKn, en: exampleEn },
    points: [
      `Uses the word "${word}" (${meaningEn}) with its correct meaning`,
      "Writes a complete, sensible Kannada sentence",
    ],
  };
}

// Word-pair exercises (opposites, plurals, gender, rhymes): [word, ...accepted answers].
export function pairs(list: [string, ...string[]][]) {
  return list.map(([prompt, ...answers]) => ({ prompt, answers }));
}
