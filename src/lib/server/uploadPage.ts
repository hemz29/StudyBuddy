import "server-only";
import { after, NextResponse } from "next/server";
import type { PracticeSession, Store } from "@/lib/store/types";
import { fail, type ImageType } from "./api";
import { readPage } from "./pipeline";

const PAGES_PER_DAY = 30;
const PAGES_PER_SESSION = 8;

// Stores a page photo and reads it in the background; the desktop polls for the result.
export async function acceptPage(store: Store, session: PracticeSession, image: { data: Buffer; type: ImageType }) {
  if (session.status === "graded") return fail(409, "This worksheet is already marked. Start a new try to send more photos.");
  const pages = await store.listPages(session.parentId, session.id);
  if (pages.length >= PAGES_PER_SESSION) return fail(429, "That's a lot of photos for one worksheet. Please check the pages you already sent.");

  const today = new Date().toISOString().slice(0, 10);
  const sessions = (await store.listSessions(session.parentId, session.childId)).filter((s) => s.startedAt.slice(0, 10) === today);
  let count = 0;
  for (const s of sessions) count += (await store.listPages(session.parentId, s.id)).length;
  if (count >= PAGES_PER_DAY) return fail(429, "That's the photo limit for today. Great work – try again tomorrow!");

  const ext = image.type.split("/")[1];
  const imageKey = `${session.parentId}/${session.id}/${Date.now()}.${ext}`;
  await store.putImage(imageKey, image.data, image.type);
  const page = await store.addPage(session.parentId, { sessionId: session.id, imageKey, status: "received", error: null });
  await store.updateSession(session.parentId, session.id, { status: "reading" });
  after(() => readPage(store, session, page, image.data, image.type));
  return NextResponse.json({ pageId: page.id });
}
