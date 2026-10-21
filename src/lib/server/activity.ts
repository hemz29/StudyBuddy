import "server-only";
import type { ActivityEvent, PracticeSession, Store } from "@/lib/store/types";

// Activity logging and the timer's end time are extras: if the database hasn't got the 0002 update yet,
// the app carries on without them.
export async function logActivity(store: Store, parentId: string, e: ActivityEvent) {
  try {
    await store.logActivity(parentId, e);
  } catch (err) {
    console.warn("activity not logged", err instanceof Error ? err.message : err);
  }
}

export async function noteWritingDone(store: Store, session: PracticeSession) {
  if (session.writingDoneAt || session.kind !== "worksheet") return;
  try {
    await store.updateSession(session.parentId, session.id, { writingDoneAt: new Date().toISOString() });
  } catch (err) {
    console.warn("writing time not saved", err instanceof Error ? err.message : err);
  }
}
