// The quick feedback survey at /feedback: its questions, and the sums for the admin page.

export const INTENT = ["Definitely", "Probably", "Not sure", "Probably not"] as const;
export const REPLACE = ["Making worksheets", "Checking answers", "Explaining meanings", "Tutor or classes", "Knowing if my child is exam-ready"] as const;

export type FeedbackAnswers = { intent: string; // Several choices; older answers hold a single string.
  replace?: string | string[]; nps: number; comment?: string };
export type FeedbackRow = { parentId: string | null; name: string | null; answers: FeedbackAnswers; createdAt: string };

// Net Promoter Score: % who give 9–10 minus % who give 0–6.
export function nps(scores: number[]) {
  if (!scores.length) return null;
  const pct = (f: (n: number) => boolean) => (scores.filter(f).length / scores.length) * 100;
  return Math.round(pct((n) => n >= 9) - pct((n) => n <= 6));
}

// Who's behind the NPS: fans (9–10), neutral (7–8) and unhappy (0–6).
export function npsBreakdown(scores: number[]) {
  return { fans: scores.filter((n) => n >= 9).length, neutral: scores.filter((n) => n >= 7 && n <= 8).length, unhappy: scores.filter((n) => n <= 6).length };
}

export const countBy = (rows: FeedbackRow[], key: "intent" | "replace", options: readonly string[]) =>
  options.map((o) => ({ what: o, n: rows.filter((r) => [r.answers[key]].flat().includes(o)).length }));
