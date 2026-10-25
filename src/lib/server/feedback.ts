import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { serviceClient } from "./context";
import type { FeedbackAnswers, FeedbackRow } from "@/lib/feedback";

// Demo mode keeps answers in a file beside the demo data.
const FILE = path.join(process.env.LOCAL_DATA_DIR ?? path.join(process.cwd(), ".data"), "feedback.json");
const readLocal = async (): Promise<FeedbackRow[]> => JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "[]"));

export async function saveFeedback(parentId: string | null, name: string | null, answers: FeedbackAnswers) {
  const db = serviceClient();
  if (!db) {
    const rows = await readLocal();
    rows.push({ parentId, name, answers, createdAt: new Date().toISOString() });
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(rows, null, 1));
    return;
  }
  const { error } = await db.from("feedback").insert({ parent_id: parentId, name, answers });
  if (error) throw new Error(error.message);
}

// All answers, newest first. `missing` is true until the feedback table has been created in Supabase.
export async function loadFeedback(): Promise<{ rows: FeedbackRow[]; missing: boolean }> {
  const db = serviceClient();
  if (!db) return { rows: (await readLocal()).reverse(), missing: false };
  const { data, error } = await db.from("feedback").select("parent_id, name, answers, created_at").order("created_at", { ascending: false }).limit(1000);
  if (error) return { rows: [], missing: true };
  return { rows: (data ?? []).map((r) => ({ parentId: r.parent_id, name: r.name, answers: r.answers, createdAt: r.created_at })), missing: false };
}
