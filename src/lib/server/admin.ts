import "server-only";
import { fromRow } from "@/lib/store/supabase";
import { localDump } from "@/lib/store/local";
import type { Child, PracticeSession, QuestionAttempt } from "@/lib/store/types";
import { serviceClient } from "./context";

// The owner's admin page: every family's activity in one place. Only these emails can open it.
const ADMINS = (process.env.ADMIN_EMAILS ?? "hemlata.v.29@gmail.com").split(",").map((e) => e.trim().toLowerCase());
export const isAdmin = (email: string) => ADMINS.includes(email.toLowerCase());

export type Family = { parentId: string; email: string; joinedAt: string | null; lastSignInAt: string | null; isGuest: boolean };
export type Activity = { parentId: string; childId: string | null; kind: string; path: string | null; createdAt: string; device: string | null };
const deviceIn = (detail: unknown) => ((detail as { device?: string } | null)?.device ?? null);
export type AdminData = {
  families: Family[];
  children: Child[];
  sessions: PracticeSession[];
  attempts: Pick<QuestionAttempt, "sessionId" | "helpLevel" | "status" | "awarded" | "max" | "method">[];
  activity: Activity[];
  aiCalls: { parentId: string; ok: boolean; inputTokens: number; outputTokens: number }[];
  activityMissing: boolean;
};

export async function loadAdminData(): Promise<AdminData> {
  const db = serviceClient();
  if (!db) {
    const d = await localDump();
    const parents = [...new Set(d.children.map((c) => c.parentId))];
    return {
      families: parents.map((p) => ({ parentId: p, email: "demo@studybuddy.local", joinedAt: null, lastSignInAt: null, isGuest: false })),
      children: d.children,
      sessions: d.sessions,
      attempts: d.attempts,
      activity: d.activity.map((a) => ({ parentId: a.parentId, childId: a.childId ?? null, kind: a.kind, path: a.path ?? null, createdAt: a.createdAt, device: deviceIn(a.detail) })),
      aiCalls: d.ai.map((a) => ({ parentId: a.parentId, ok: a.ok, inputTokens: a.inputTokens, outputTokens: a.outputTokens })),
      activityMissing: false,
    };
  }

  const all = async (table: string, columns = "*") => {
    const { data, error } = await db.from(table).select(columns).limit(5000);
    return { rows: ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => fromRow<Record<string, unknown>>(r)), error };
  };
  const [users, children, sessions, attempts, activity, ai] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    all("children"),
    all("practice_sessions"),
    all("question_attempts", "session_id, help_level, status, awarded, max, method"),
    all("activity_events", "parent_id, child_id, kind, path, created_at, detail"),
    all("ai_usage_events", "parent_id, ok, input_tokens, output_tokens"),
  ]);
  return {
    families: (users.data?.users ?? []).map((u) => ({ parentId: u.id, email: u.email ?? "", joinedAt: u.created_at ?? null, lastSignInAt: u.last_sign_in_at ?? null, isGuest: Boolean(u.is_anonymous) })),
    children: children.rows as unknown as Child[],
    sessions: (sessions.rows as unknown as PracticeSession[]).map((s) => ({ ...s, awarded: s.awarded === null ? null : Number(s.awarded), max: s.max === null ? null : Number(s.max) })),
    attempts: (attempts.rows as unknown as AdminData["attempts"]).map((a) => ({ ...a, awarded: a.awarded === null ? null : Number(a.awarded), max: Number(a.max) })),
    activity: (activity.rows as unknown as (Activity & { detail?: unknown })[]).map(({ detail, ...a }) => ({ ...a, device: deviceIn(detail) })),
    aiCalls: ai.rows as unknown as AdminData["aiCalls"],
    activityMissing: Boolean(activity.error),
  };
}
