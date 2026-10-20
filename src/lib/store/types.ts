import type { QuestionType, Skill } from "@/content/schema";

export const THEMES = ["kitten", "space", "floral", "speed", "geometric"] as const;
export type Theme = (typeof THEMES)[number];

export type Child = { id: string; parentId: string; nickname: string; theme: Theme; createdAt: string };

export type SessionStatus = "writing" | "reading" | "checking" | "graded";
export type PracticeSession = {
  id: string;
  parentId: string;
  childId: string;
  kind: "worksheet" | "cards";
  worksheetId: string;
  // A retry of a worksheet points at the session it retries; the trend chart uses first attempts only.
  retryOf: string | null;
  status: SessionStatus;
  markingVersion: string;
  // "I'm stuck" help: highest help level opened per question id (0 = none).
  help: Record<string, number>;
  awarded: number | null;
  max: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type UncertainWord = { index: number; word: string; alternatives: string[] };

export type PageUpload = {
  id: string;
  sessionId: string;
  imageKey: string;
  status: "received" | "reading" | "read" | "failed";
  error: string | null;
  createdAt: string;
};

// One child answer as read from a photo, before and after grading.
export type QuestionAttempt = {
  id: string;
  sessionId: string;
  parentId: string;
  childId: string;
  questionId: string;
  type: QuestionType;
  skill: Skill;
  pageId: string | null;
  // Vertical position of the answer on the page (0–1), used to show the child's handwriting strip.
  region: { top: number; bottom: number } | null;
  text: string;
  confidence: "high" | "low";
  uncertainWords: UncertainWord[];
  readingConfirmed: boolean;
  misreadFlagged: boolean;
  helpLevel: number;
  awarded: number | null;
  max: number;
  status: "correct" | "partial" | "incorrect" | "blank" | "review" | null;
  method: "key" | "ai" | "reviewer" | null;
  feedback: AttemptFeedback | null;
  markingVersion: string;
  createdAt: string;
};

export type AttemptFeedback = {
  en: string;
  points?: { point: string; met: boolean }[];
  nearMiss?: { wrote: string; correct: string };
  model?: { kn: string; en: string };
};

export type UploadToken = {
  token: string;
  parentId: string;
  childId: string;
  sessionId: string;
  expiresAt: string;
  usedAt: string | null;
};

export type AiUsageEvent = {
  purpose: "read_answers" | "grade_answers";
  model: string;
  sessionId: string | null;
  inputTokens: number;
  outputTokens: number;
  ms: number;
  ok: boolean;
  error: string | null;
};

// Every call is scoped to the signed-in parent. The Supabase implementation also enforces this with RLS.
export interface Store {
  listChildren(parentId: string): Promise<Child[]>;
  getChild(parentId: string, childId: string): Promise<Child | null>;
  createChild(parentId: string, nickname: string, theme: Theme): Promise<Child>;
  updateChild(parentId: string, childId: string, patch: Partial<Pick<Child, "nickname" | "theme">>): Promise<void>;
  deleteChild(parentId: string, childId: string): Promise<void>;

  createSession(s: Omit<PracticeSession, "id" | "startedAt">): Promise<PracticeSession>;
  getSession(parentId: string, sessionId: string): Promise<PracticeSession | null>;
  updateSession(parentId: string, sessionId: string, patch: Partial<PracticeSession>): Promise<void>;
  listSessions(parentId: string, childId: string): Promise<PracticeSession[]>;

  addPage(parentId: string, page: Omit<PageUpload, "id" | "createdAt">): Promise<PageUpload>;
  updatePage(parentId: string, pageId: string, patch: Partial<PageUpload>): Promise<void>;
  listPages(parentId: string, sessionId: string): Promise<PageUpload[]>;

  // Replaces all attempts of a session (re-reading a page re-creates them).
  replaceAttempts(parentId: string, sessionId: string, attempts: Omit<QuestionAttempt, "id" | "createdAt">[]): Promise<void>;
  updateAttempt(parentId: string, attemptId: string, patch: Partial<QuestionAttempt>): Promise<void>;
  listSessionAttempts(parentId: string, sessionId: string): Promise<QuestionAttempt[]>;
  listChildAttempts(parentId: string, childId: string): Promise<QuestionAttempt[]>;

  createToken(t: Omit<UploadToken, "usedAt">): Promise<void>;
  getToken(token: string): Promise<UploadToken | null>;

  putImage(key: string, data: Buffer, contentType: string): Promise<void>;
  getImage(key: string): Promise<Buffer | null>;

  logAi(parentId: string, e: AiUsageEvent): Promise<void>;
}
