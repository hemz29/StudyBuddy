import { LESSONS } from "./index";
import aiWords from "./grade6/words.json";
import { NUMBER_NAMES } from "./grade6/numbers";

// Word meanings for hover/tap and for hints. The teacher's word list comes first; every other word has an
// AI-suggested meaning with a confidence level, waiting for review by a Kannada teacher.
export type WordMeaning = {
  word: string;
  en: string;
  base?: string;
  baseEn?: string;
  source: "teacher" | "ai";
  confidence?: "high" | "medium" | "low";
  meaningKn?: string;
};

type AiWord = { word: string; en: string; base?: string; baseEn?: string; confidence: "high" | "medium" | "low"; note?: string; reviewed?: boolean };

export const stripPunct = (w: string) => w.replace(/[“”"'‘’.,?!;:()[\]–—…\-।]/g, "").trim();

const TEACHER = new Map<string, WordMeaning>();
for (const l of LESSONS)
  for (const g of l.glossary) TEACHER.set(g.word, { word: g.word, en: g.meaningEn, meaningKn: g.meaningKn, source: "teacher" });

// Number names come from the teacher's notes, so their meaning is exact: ಎರಡು = 2.
for (const [n, names] of Object.entries(NUMBER_NAMES))
  for (const w of names) if (!TEACHER.has(w)) TEACHER.set(w, { word: w, en: n, source: "teacher" });

const AI = new Map<string, WordMeaning>();
for (const w of aiWords as AiWord[])
  AI.set(w.word, { word: w.word, en: w.en, base: w.base, baseEn: w.baseEn, source: w.reviewed ? "teacher" : "ai", confidence: w.confidence });

export function meaningOf(raw: string): WordMeaning | undefined {
  const w = stripPunct(raw);
  if (!w) return undefined;
  const teacher = TEACHER.get(w);
  if (teacher) return teacher;
  const ai = AI.get(w);
  // An inflected form of a teacher's word (ಗುಹೆಯನ್ನು → ಗುಹೆ) shows the teacher's meaning of the root too.
  const root = ai?.base ? TEACHER.get(ai.base) : undefined;
  if (ai && root) return { ...ai, baseEn: root.en };
  return ai;
}

// Kannada letters as written units (consonant clusters with their vowel sign), e.g. "ಲಕ್ಷ್ಯ" → ["ಲ", "ಕ್ಷ್ಯ"].
const AKSHARA = /[ಅ-ಔೠೡ][ಂಃ]?|[ಕ-ಹೞ](?:್[ಕ-ಹೞ])*(?:[ಾ-ೌೕೖ್])?[ಂಃ]?|\S/gu;
export const aksharas = (s: string) => s.match(AKSHARA) ?? [];
