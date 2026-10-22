import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { AiUsageEvent } from "@/lib/store/types";

// All Claude calls go through here so each one is logged (tokens, time, success) without answer text or images.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";
export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ timeout: 120_000, maxRetries: 2 }));

type Log = (e: AiUsageEvent) => Promise<void>;

async function call<T extends z.ZodType>(
  purpose: AiUsageEvent["purpose"],
  sessionId: string | null,
  log: Log,
  schema: T,
  content: Anthropic.Beta.BetaContentBlockParam[],
  system: string,
  effort: "low" | "medium" | "high",
): Promise<z.infer<T>> {
  const started = Date.now();
  try {
    const res = await anthropic().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      output_config: { effort, format: betaZodOutputFormat(schema) },
      messages: [{ role: "user", content }],
    });
    if (res.stop_reason === "refusal") throw new Error("The AI declined this request.");
    if (!res.parsed_output) throw new Error(`Unreadable AI response (${res.stop_reason}).`);
    await log({ purpose, model: res.model, sessionId, inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens, ms: Date.now() - started, ok: true, error: null });
    return res.parsed_output as z.infer<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await log({ purpose, model: MODEL, sessionId, inputTokens: 0, outputTokens: 0, ms: Date.now() - started, ok: false, error: message.slice(0, 300) }).catch(() => {});
    throw err;
  }
}

// ---------- Reading handwritten answers ----------

export const ReadingSchema = z.object({
  pageQuality: z.enum(["ok", "blurry_or_dark", "not_a_worksheet"]),
  answers: z.array(
    z.object({
      questionNumber: z.string().describe('The worksheet number, e.g. "3.2" for section 3, item 2'),
      text: z.string().describe("Exactly what the child wrote, letter for letter, including mistakes. Empty if blank."),
      confidence: z.enum(["high", "low"]),
      uncertainWords: z.array(
        z.object({
          word: z.string().describe("The word as you read it"),
          alternatives: z.array(z.string()).describe("Up to 3 other readings that the handwriting could also be"),
        }),
      ),
      top: z.number().describe("Top of the handwritten answer as a fraction of page height (0-1)"),
      bottom: z.number().describe("Bottom of the handwritten answer as a fraction of page height (0-1)"),
    }),
  ),
});
export type Reading = z.infer<typeof ReadingSchema>;

const READ_SYSTEM = `You read photos of a Grade 6 child's handwritten Kannada (3rd language) worksheet so the answers can be marked.

Your only job is transcription. Write down exactly what the child wrote, letter for letter, in Unicode Kannada (or English where they wrote English). Never correct spelling, grammar, missing letters or wrong vowel signs, and never fill in what the answer "should" be: a faithful transcription of a mistake is what lets the child see and fix it. You are not told the correct answers, on purpose.

For each answer you can see on the page, give its worksheet number (section.item) from the question list you are given. If the page is numbered differently (a notebook, or another copy of the worksheet), match each answer to the list by its printed word or question instead. Mark confidence "low" when any word could reasonably be read another way (similar-looking letters such as ಮಾ/ಮೊ, ಬ/ಐ, ದ/ಧ, ತ/ಶ, missing or extra ottakshara), and list those words with up to three alternative readings based only on the shapes in the photo. If an answer is crossed out and rewritten, transcribe the final version. If an answer is blank, return empty text with high confidence. Only include questions that appear on this page.`;

export async function readAnswerPage(
  image: { base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" },
  questions: { number: string; prompt: string; kind: string }[],
  sessionId: string,
  log: Log,
) {
  const list = questions.map((q) => `${q.number}  [${q.kind}]  ${q.prompt}`).join("\n");
  return call("read_answers", sessionId, log, ReadingSchema, [
    { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
    { type: "text", text: `Worksheet questions (number, kind, printed prompt):\n${list}\n\nTranscribe the child's answers on this page.` },
  ], READ_SYSTEM, "medium");
}

// ---------- Marking descriptive answers ----------

export const MarkingSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      pointsMet: z.array(z.boolean()).describe("One entry per rubric point, in order"),
      feedbackEn: z.string().describe("One or two short, kind sentences for a 11-year-old, in simple English"),
      spellingNotes: z.array(z.object({ wrote: z.string(), correct: z.string() })).describe("Kannada words the child misspelled"),
    }),
  ),
});

const MARK_SYSTEM = `You mark a Grade 6 child's Kannada (3rd language) answers against the teacher's rubric points.

For each answer decide, point by point, whether the child's answer shows that point. Accept any wording, word order or synonym that means the same thing as the model answer; children answer in their own words. Small spelling mistakes do not make a point unmet, but list them in spellingNotes so the child can see the correct spelling. A point is unmet only if the idea is missing, wrong, or the answer is about something else. For "use the word in your own sentence", the teacher's sentence is only an example: any sensible sentence that uses the word with its correct meaning meets the points.

For a "synonym check" item, there is one point: whether the child's answer is an acceptable meaning (or word) for the prompt in this lesson. Be fair but not generous: a different but correct synonym is acceptable; a misspelled word that is clearly the intended answer is acceptable; a word with a different meaning is not.

Write feedbackEn for the child: say what was good and, if a point was missed, what to add next time. Never mention rubric points or marks.`;

export type MarkItem = {
  id: string;
  kind: "one_sentence" | "own_sentence" | "synonym_check";
  prompt: string;
  promptEn?: string;
  modelKn?: string;
  modelEn?: string;
  points: string[];
  answer: string;
};

export async function markAnswers(items: MarkItem[], sessionId: string, log: Log) {
  const text = items
    .map(
      (it) =>
        `### id: ${it.id}\nkind: ${it.kind}\nprompt: ${it.prompt}${it.promptEn ? ` (${it.promptEn})` : ""}\n` +
        (it.modelKn ? `teacher's model answer: ${it.modelKn}${it.modelEn ? ` (${it.modelEn})` : ""}\n` : "") +
        `rubric points:\n${it.points.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}\nchild's answer: ${it.answer}`,
    )
    .join("\n\n");
  return call("grade_answers", sessionId, log, MarkingSchema, [{ type: "text", text }], MARK_SYSTEM, "medium");
}
