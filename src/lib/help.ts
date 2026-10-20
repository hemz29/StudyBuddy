import { getLesson } from "@/content";
import type { Question, QuestionType } from "@/content/schema";
import { transliterate } from "./transliterate";

// The four "I'm stuck" steps for a question. Each step gives a little more; none of them changes marks.
const ASKING: Record<QuestionType, (q: Question) => string> = {
  meaning_kn: (q) => `Write what "${q.prompt}" means, using other Kannada word(s).`,
  meaning_en: (q) => `Write what "${q.prompt}" means in English.`,
  en_to_kn: (q) => `Write the Kannada word from the lesson that means "${q.prompt}".`,
  opposite: (q) => `Write a word that means the opposite of "${q.prompt}".`,
  gender: (q) => `"${q.prompt}" is one gender (male/female). Write the word for the other gender.`,
  plural: (q) => `"${q.prompt}" is one. Write the word for many.`,
  split: (q) => `"${q.prompt}" is two words joined together. Write the two words with a + between them.`,
  rhyme: (q) => `Find the word in the poem that rhymes with "${q.prompt}" (sounds the same at the end).`,
  number_name: (q) => `Write the number ${q.promptEn} in Kannada words.`,
  fill_blank: () => "Write the missing word from the lesson in the blank.",
  who_said: (q) => `Who said ${q.promptEn ?? "these words"}, and to whom? Write both names in one sentence.`,
  one_sentence: (q) => `${q.promptEn ?? "Answer the question"} — answer in one full Kannada sentence. Start by repeating words from the question.`,
  own_sentence: (q) => `Make your own Kannada sentence that uses "${q.prompt}"${q.promptEn ? ` (it means ${q.promptEn})` : ""}.`,
  poem_line: () => "Write this line of the poem from memory.",
  poet_name: () => "Write the name of the poet who wrote the poem.",
};

export type HelpStep = { title: string; body: string; kn?: string };

export function helpSteps(q: Question): HelpStep[] {
  const lesson = getLesson(q.id.split(".")[0]);
  const text = `${q.prompt} ${q.model?.kn ?? ""}`;
  const words = (lesson?.glossary ?? []).filter((g) => text.includes(g.word)).slice(0, 4);
  const firstAnswer = q.model?.kn ?? q.answers[0] ?? "";
  const clue =
    q.points?.[0] ??
    (q.type === "who_said" ? `The speaker's name starts with "${(q.speaker?.[0] ?? "").slice(0, 2)}…"` : `It starts with "${[...(q.answers[0] ?? "")].slice(0, 2).join("")}…"`);

  return [
    { title: "What is the question asking?", body: ASKING[q.type](q) },
    {
      title: "Words that help",
      body: words.length
        ? words.map((w) => `${w.word} (${transliterate(w.word)}) = ${w.meaningEn}`).join("\n")
        : `Say the question aloud: ${transliterate(q.prompt)}`,
    },
    { title: "A clue", body: clue },
    { title: "Model answer", body: "Read it, then cover it and write it from memory in your own handwriting.", kn: firstAnswer },
  ];
}
