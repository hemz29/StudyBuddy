import { SKILLS, type QuestionType, type Skill } from "@/content/schema";
import { getWorksheet, SECTION_TEXT } from "@/content";
import type { AttemptScore, PracticeSession, QuestionAttempt } from "@/lib/store/types";

// Everything on the parent dashboard is computed here from saved attempts – no AI involved.

export type SkillRow = {
  skill: Skill;
  label: string;
  status: "not_started" | "in_progress" | "recent";
  attempted: number;
  earned: number;
  available: number;
  pct: number | null;
};

export type TrendPoint = { sessionId: string; date: string; title: string; awarded: number; max: number; pct: number; ownPct: number };

const DAY = 24 * 60 * 60 * 1000;
const scored = (a: AttemptScore) => a.awarded !== null && a.status !== "blank";

export function skillRows(attempts: AttemptScore[], now = Date.now()): SkillRow[] {
  return (Object.keys(SKILLS) as Skill[]).map((skill) => {
    const mine = attempts.filter((a) => a.skill === skill && scored(a));
    const earned = mine.reduce((t, a) => t + (a.awarded ?? 0), 0);
    const available = mine.reduce((t, a) => t + a.max, 0);
    const last = mine.reduce((t, a) => Math.max(t, Date.parse(a.createdAt)), 0);
    return {
      skill,
      label: SKILLS[skill].en,
      status: mine.length === 0 ? "not_started" : now - last < 7 * DAY ? "recent" : "in_progress",
      attempted: mine.length,
      earned,
      available,
      pct: available ? Math.round((earned / available) * 100) : null,
    };
  });
}

// First attempts only, in date order, so a retry of the same sheet doesn't inflate the trend.
export function scoreTrend(sessions: PracticeSession[], attempts: QuestionAttempt[]): TrendPoint[] {
  return sessions
    .filter((s) => s.kind === "worksheet" && s.status === "graded" && !s.retryOf && s.max)
    .sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""))
    .map((s) => {
      const answered = attempts.filter((a) => a.sessionId === s.id && a.text.trim());
      const own = answered.filter((a) => a.helpLevel === 0).length;
      return {
        sessionId: s.id,
        date: s.completedAt ?? s.startedAt,
        title: getWorksheet(s.worksheetId)?.title.en ?? s.worksheetId,
        awarded: s.awarded ?? 0,
        max: s.max ?? 0,
        pct: Math.round(((s.awarded ?? 0) / (s.max || 1)) * 100),
        ownPct: answered.length ? Math.round((own / answered.length) * 100) : 0,
      };
    });
}

// Suggests the question type missed most often recently, but only with enough evidence (5+ scored answers).
export function recommendation(attempts: QuestionAttempt[]): { text: string; type: QuestionType } | null {
  const recent = attempts.filter(scored).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 80);
  const byType = new Map<QuestionType, QuestionAttempt[]>();
  for (const a of recent) byType.set(a.type, [...(byType.get(a.type) ?? []), a]);
  let best: { type: QuestionType; missed: number; total: number; rate: number } | null = null;
  for (const [type, list] of byType) {
    const last = list.slice(0, 8);
    if (last.length < 5) continue;
    const missed = last.filter((a) => (a.awarded ?? 0) < a.max).length;
    const rate = missed / last.length;
    if (rate >= 0.4 && (!best || rate > best.rate)) best = { type, missed, total: last.length, rate };
  }
  if (!best) return null;
  return {
    type: best.type,
    text: `Practise "${SECTION_TEXT[best.type].en.replace(/\.$/, "")}": ${best.missed} of the last ${best.total} answers of this kind lost marks.`,
  };
}

// Finished attempts per worksheet, for the "Done ×2" badges.
export function doneCounts(sessions: PracticeSession[]) {
  const done = new Map<string, number>();
  for (const s of sessions) if (s.status === "graded" && s.kind === "worksheet") done.set(s.worksheetId, (done.get(s.worksheetId) ?? 0) + 1);
  return done;
}
