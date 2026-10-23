import "server-only";
import { headers } from "next/headers";
import { deviceOf } from "@/lib/device";
import type { ActivityEvent, PracticeSession, Store } from "@/lib/store/types";

// Activity logging and the timer's end time are extras: if the database hasn't got the 0002 update yet,
// the app carries on without them.
// Each event notes the kind of device (phone, tablet or computer), so the pilot shows how families really use Nudi.
export async function logActivity(store: Store, parentId: string, e: ActivityEvent) {
  try {
    const device = deviceOf((await headers()).get("user-agent"));
    await store.logActivity(parentId, { ...e, detail: { ...e.detail, device } });
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
