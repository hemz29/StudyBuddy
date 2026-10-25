// The quick feedback survey at /feedback: its questions, and the sums for the admin page.

export const INTENT = ["Definitely", "Probably", "Not sure", "Probably not"] as const;
export const REPLACE = ["Making worksheets", "Checking answers", "Explaining meanings", "Tutor or classes", "Knowing if my child is exam-ready"] as const;

export type FeedbackAnswers = { intent: string; replace: string; nps: number; comment?: string };
export type FeedbackRow = { parentId: string | null; name: string | null; answers: FeedbackAnswers; createdAt: string };

// Net Promoter Score: % who give 9–10 minus % who give 0–6.
export function nps(scores: number[]) {
  if (!scores.length) return null;
  const pct = (f: (n: number) => boolean) => (scores.filter(f).length / scores.length) * 100;
  return Math.round(pct((n) => n >= 9) - pct((n) => n <= 6));
}

export const countBy = (rows: FeedbackRow[], key: "intent" | "replace", options: readonly string[]) =>
  options.map((o) => ({ what: o, n: rows.filter((r) => r.answers[key] === o).length }));
