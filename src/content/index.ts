import { LessonSchema, type Lesson, type Question, type QuestionType } from "./schema";
import { panchatantra } from "./grade6/panchatantra";
import { nannaDesha, nannaDeshaStanzas } from "./grade6/nannaDesha";
import { kugutidePakshi } from "./grade6/kugutidePakshi";
import { numberQuestion } from "./grade6/numbers";
import marking from "./grade6/marking.json";

export const LESSONS: Lesson[] = [panchatantra, nannaDesha, kugutidePakshi].map((l) => LessonSchema.parse(l));

export const MARKING = marking as { version: string; label: string; perType: Record<QuestionType, number> };
export const marksFor = (type: QuestionType) => MARKING.perType[type] ?? 1;

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

// Section order and instructions follow the school's Grade VI worksheet.
export const SECTION_ORDER: QuestionType[] = [
  "meaning_kn", "meaning_en", "en_to_kn", "opposite", "gender", "plural", "split",
  "one_sentence", "who_said", "fill_blank", "own_sentence", "rhyme", "number_name", "poem_line", "poet_name",
];

export const SECTION_TEXT: Record<QuestionType, { kn: string; en: string }> = {
  meaning_kn: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.", en: "Write Kannada meaning for the following words." },
  meaning_en: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.", en: "Write English meaning for the following words." },
  en_to_kn: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಅರ್ಥ ಬರೆಯಿರಿ.", en: "Write Kannada meaning for the following words." },
  opposite: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ವಿರುದ್ಧ ಪದ ಬರೆಯಿರಿ.", en: "Write opposite words for the following words." },
  gender: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಲಿಂಗ ಬದಲಿಸಿ ಬರೆಯಿರಿ.", en: "Change gender for the following words." },
  plural: { kn: "ಕೆಳಗಿನ ಪದಗಳನ್ನು ಬಹುವಚನದಲ್ಲಿ ಬರೆಯಿರಿ.", en: "Write plural form for the following words." },
  split: { kn: "ಕೆಳಗಿನ ಪದಗಳನ್ನು ಬಿಡಿಸಿ ಬರೆಯಿರಿ.", en: "Split and write." },
  one_sentence: { kn: "ಒಂದು ವಾಕ್ಯದಲ್ಲಿ ಉತ್ತರ ಬರೆಯಿರಿ.", en: "Answer the following questions in one sentence." },
  who_said: { kn: "ಯಾರು, ಯಾರಿಗೆ ಹೇಳಿದರು?", en: "Who said to whom?" },
  fill_blank: { kn: "ಬಿಟ್ಟ ಸ್ಥಳ ತುಂಬಿರಿ.", en: "Fill in the blanks." },
  own_sentence: { kn: "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಾಕ್ಯ ರಚನೆ ಮಾಡಿ.", en: "Make sentences for the following words in Kannada." },
  rhyme: { kn: "ಪ್ರಾಸ ಪದಗಳನ್ನು ಬರೆಯಿರಿ.", en: "Write the rhyming words from the poem." },
  number_name: { kn: "ಕೆಳಗಿನ ಅಂಕಿಗಳಿಗೆ ಸಂಖ್ಯಾ ಪದ ಬರೆಯಿರಿ.", en: "Write number names in Kannada." },
  poem_line: { kn: "ಪದ್ಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.", en: "Complete the following poem." },
  poet_name: { kn: "ಕವಿಯ ಹೆಸರನ್ನು ಬರೆಯಿರಿ.", en: "Write the name of the poet." },
};

// Every question by id, including number names, which belong to no lesson.
const QUESTIONS = new Map<string, Question & { lessonId?: string }>();
for (const l of LESSONS)
  for (const ex of l.exercises) for (const q of ex.questions) QUESTIONS.set(q.id, { ...q, lessonId: l.id });
for (let n = 1; n <= 50; n++) {
  const q = numberQuestion(n);
  QUESTIONS.set(q.id, { ...q, answers: [...q.answers] });
}

export function getQuestion(id: string) {
  return QUESTIONS.get(id);
}

export type WorksheetSection = { type: QuestionType; kn: string; en: string; marksEach: number; questions: Question[] };
export type Worksheet = {
  id: string;
  title: { kn: string; en: string };
  lessonIds: string[];
  sections: WorksheetSection[];
  totalMarks: number;
  // For poem completion: the line printed before the blanks, per stanza.
  poemCues?: string[];
};

function find(lessonId: string, type: QuestionType, prompt: string) {
  const lesson = getLesson(lessonId)!;
  for (const ex of lesson.exercises)
    if (ex.type === type) {
      const q = ex.questions.find((x) => x.prompt === prompt);
      if (q) return q;
    }
  throw new Error(`Worksheet question not found: ${lessonId} ${type} ${prompt}`);
}

function build(id: string, title: Worksheet["title"], lessonIds: string[], picks: Question[], poemCues?: string[]): Worksheet {
  const sections = SECTION_ORDER.map((type) => ({
    type,
    ...SECTION_TEXT[type],
    marksEach: marksFor(type),
    questions: picks.filter((q) => q.type === type),
  })).filter((s) => s.questions.length);
  const totalMarks = sections.reduce((t, s) => t + s.marksEach * s.questions.length, 0);
  return { id, title, lessonIds, sections, totalMarks, poemCues };
}

// How many items of each type a chapter worksheet takes (set A takes the first ones, set B the next).
const PER_TYPE: Partial<Record<QuestionType, number>> = {
  meaning_kn: 3, meaning_en: 3, en_to_kn: 2, opposite: 3, gender: 3, plural: 3, split: 3,
  one_sentence: 4, who_said: 2, fill_blank: 2, own_sentence: 2, rhyme: 3, poem_line: 4, poet_name: 1,
};

function chapterWorksheet(lesson: Lesson, set: 0 | 1): Worksheet {
  const picks: Question[] = [];
  for (const ex of lesson.exercises) {
    const n = PER_TYPE[ex.type] ?? 0;
    let chosen = ex.questions.slice(set * n, set * n + n);
    // Short exercises (e.g. 3 who-said items) wrap around rather than leaving set B empty.
    if (chosen.length === 0) chosen = ex.questions.slice(0, n);
    if (ex.type === "poem_line" && set === 1) chosen = ex.questions.slice(4, 8);
    picks.push(...chosen);
  }
  const label = set === 0 ? "A" : "B";
  const poemCues = lesson.id === "nanna-desha" ? [set === 0 ? nannaDeshaStanzas[1][0][0] : nannaDeshaStanzas[2][0][0]] : undefined;
  return build(
    `${lesson.id}-${label.toLowerCase()}`,
    { kn: `${lesson.title.kn} – ಅಭ್ಯಾಸ ${label}`, en: `${lesson.title.en} – Practice ${label}` },
    [lesson.id],
    picks,
    poemCues,
  );
}

const P = "panchatantra";
const N = "nanna-desha";

// Mirrors the school's Grade VI worksheet (Panchatantra + Nanna Desha Nanna Jana).
const termPractice = build(
  "term-practice-1",
  { kn: "ಅಭ್ಯಾಸ ಪತ್ರಿಕೆ ೧ (ಪಂಚತಂತ್ರ, ನನ್ನ ದೇಶ ನನ್ನ ಜನ)", en: "Term practice 1 (Panchatantra + Nanna Desha Nanna Jana)" },
  [P, N],
  [
    find(N, "meaning_kn", "ಪ್ರಾಚೀನ"), find(P, "meaning_kn", "ಕೊಂಚ"), find(P, "meaning_kn", "ಗುಹೆ"), find(N, "meaning_kn", "ಒಕ್ಕಲು"),
    find(P, "meaning_en", "ಸಂದೇಹ"), find(P, "meaning_en", "ಪುರಾತನ"), find(P, "meaning_en", "ಊಳಿ"), find(P, "meaning_en", "ಮಂದಿ"),
    find(P, "en_to_kn", "Attention"), find(N, "en_to_kn", "Debt"), find(P, "en_to_kn", "Noble"), find(N, "en_to_kn", "The present"),
    find(P, "opposite", "ಧೈರ್ಯ"), find(N, "opposite", "ಮಾನ"), find(P, "opposite", "ದುಃಖ"), find(P, "opposite", "ಲಕ್ಷ್ಯ"),
    find(P, "gender", "ಸಿಂಹ"), find(P, "gender", "ನಾಯಕ"), find(P, "gender", "ಗಂಡು"), find(P, "gender", "ತಂದೆ"),
    find(P, "plural", "ಸ್ನೇಹಿತ"), find(P, "plural", "ದೇಶ"), find(P, "plural", "ಕಲೆ"), find(P, "plural", "ಜನ"),
    find(N, "split", "ಎದ್ದೇಳಿ"), find(P, "split", "ಗುಹೆಯನ್ನು"), find(P, "split", "ವಿದ್ಯಾಭ್ಯಾಸ"), find(P, "split", "ದುಃಖವಾಯಿತು"),
    find(N, "one_sentence", "ಕವಿ ಕಣವಿಯವರು ಸ್ವಚ್ಛಂದದ ಹಕ್ಕಿಗಳು ಎಂದು ಯಾರನ್ನು ಕರೆದಿದ್ದಾರೆ?"),
    find(P, "one_sentence", "ರಾಜನಿಗೆ ತನ್ನ ಮಕ್ಕಳ ಬಗ್ಗೆ ಏಕೆ ದುಃಖವಾಯಿತು?"),
    find(N, "one_sentence", "ಕಣವಿಯವರು ತನ್ನ ದೇಶ ಮತ್ತು ಜನರನ್ನು ಏನೆಂದು ಭಾವಿಸಿದ್ದಾರೆ?"),
    find(P, "one_sentence", "ವಿಷ್ಣುಶರ್ಮನು ರಾಜನಿಗೆ ಏನೆಂದು ಹೇಳಿದನು?"),
    find(N, "one_sentence", "'ನನ್ನ ದೇಶ ನನ್ನ ಜನ' ಪದ್ಯವನ್ನು ಬರೆದ ಕವಿ ಯಾರು?"),
    find(P, "one_sentence", "ನರಿಯು ತನ್ನ ಗುಹೆಯನ್ನು ಏಕೆ ತ್ಯಜಿಸಿತು?"),
    find(P, "who_said", "“ನಿಮ್ಮಲ್ಲಿ ಯಾರಾದರೂ ನನಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲಿರಾ?”"),
    find(P, "who_said", "“ನರಿರಾಯರೇ, ಬರಬೇಕು, ಬರಬೇಕು.”"),
    find(N, "own_sentence", "ಜೀವಕಳೆ"), find(P, "own_sentence", "ಅಪೂರ್ವ"), find(P, "own_sentence", "ವಿದ್ಯಾಭ್ಯಾಸ"), find(N, "own_sentence", "ಋಣ"),
    getQuestion("numbers.44")!, getQuestion("numbers.33")!, getQuestion("numbers.43")!, getQuestion("numbers.35")!,
    ...getLesson(N)!.exercises.find((e) => e.type === "poem_line")!.questions,
    ...getLesson(N)!.exercises.find((e) => e.type === "poet_name")!.questions,
  ],
  [nannaDeshaStanzas[1][0][0], nannaDeshaStanzas[2][0][0]],
);

export const WORKSHEETS: Worksheet[] = [
  termPractice,
  ...LESSONS.flatMap((l) => [chapterWorksheet(l, 0), chapterWorksheet(l, 1)]),
];

export function getWorksheet(id: string) {
  return WORKSHEETS.find((w) => w.id === id);
}

// Questions are numbered within their section, as on a school paper.
export function worksheetQuestionNumber(ws: Worksheet, qid: string) {
  for (const [si, s] of ws.sections.entries()) {
    const qi = s.questions.findIndex((q) => q.id === qid);
    if (qi >= 0) return `${si + 1}.${qi + 1}`;
  }
  return "?";
}
