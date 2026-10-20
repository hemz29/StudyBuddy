import { getQuestion, getWorksheet, marksFor } from "@/content";
import { KEY_GRADED } from "@/content/schema";
import type { MarkItem } from "@/lib/ai";
import type { AttemptFeedback, QuestionAttempt } from "@/lib/store/types";
import { gradeByKey } from "./answerKey";

type MarkResult = { id: string; pointsMet: boolean[]; feedbackEn: string; spellingNotes: { wrote: string; correct: string }[] };
export type Marker = (items: MarkItem[]) => Promise<{ results: MarkResult[] }>;

// Marks are always computed here, in code: the AI only says which rubric points an answer shows.
const roundHalf = (x: number) => Math.round(x * 2) / 2;

export async function gradeAttempts<A extends Pick<QuestionAttempt, "questionId" | "text" | "max">>(
  attempts: A[],
  marker: Marker | null,
): Promise<(A & Pick<QuestionAttempt, "awarded" | "status" | "method" | "feedback">)[]> {
  const out = new Map<string, Pick<QuestionAttempt, "awarded" | "status" | "method" | "feedback">>();
  const aiItems: MarkItem[] = [];

  for (const a of attempts) {
    const q = getQuestion(a.questionId)!;
    const model = q.model;
    if (!a.text.trim()) {
      out.set(a.questionId, { awarded: 0, status: "blank", method: "key", feedback: { en: "Not answered.", model } });
      continue;
    }
    if (KEY_GRADED.includes(q.type)) {
      const r = gradeByKey(q, a.text);
      if (r.status !== "unsure") {
        out.set(a.questionId, {
          awarded: roundHalf(r.fraction * a.max),
          status: r.status,
          method: "key",
          feedback: { en: r.feedbackEn, nearMiss: r.nearMiss, model },
        });
        continue;
      }
      aiItems.push({ id: q.id, kind: "synonym_check", prompt: q.prompt, promptEn: q.promptEn, modelKn: q.answers.join(" / "), points: ["The answer is an acceptable meaning/word for the prompt"], answer: a.text });
    } else {
      aiItems.push({ id: q.id, kind: q.type as "one_sentence" | "own_sentence", prompt: q.prompt, promptEn: q.promptEn, modelKn: model?.kn, modelEn: model?.en, points: q.points ?? [], answer: a.text });
    }
  }

  let results: MarkResult[] = [];
  if (aiItems.length && marker) {
    try {
      results = (await marker(aiItems)).results;
    } catch {
      results = [];
    }
  }

  for (const item of aiItems) {
    const a = attempts.find((x) => x.questionId === item.id)!;
    const q = getQuestion(item.id)!;
    const r = results.find((x) => x.id === item.id);
    if (!r || r.pointsMet.length !== item.points.length) {
      // No usable AI result: never invent a mark; a reviewer marks it instead.
      out.set(item.id, { awarded: null, status: "review", method: null, feedback: { en: "Your teacher-helper will check this one.", model: q.model } });
      continue;
    }
    const met = r.pointsMet.filter(Boolean).length;
    const fraction = met / item.points.length;
    const feedback: AttemptFeedback = {
      en: r.feedbackEn,
      points: item.kind === "synonym_check" ? undefined : item.points.map((p, i) => ({ point: p, met: r.pointsMet[i] })),
      nearMiss: r.spellingNotes[0],
      model: q.model,
    };
    out.set(item.id, {
      awarded: Math.min(a.max, roundHalf(fraction * a.max)),
      status: fraction === 1 ? "correct" : fraction === 0 ? "incorrect" : "partial",
      method: "ai",
      feedback,
    });
  }

  return attempts.map((a) => ({ ...a, ...out.get(a.questionId)! }));
}

export function worksheetQuestionIds(worksheetId: string) {
  const ws = getWorksheet(worksheetId);
  return ws ? ws.sections.flatMap((s) => s.questions.map((q) => q.id)) : [];
}

export const maxFor = (questionId: string) => marksFor(getQuestion(questionId)!.type);
