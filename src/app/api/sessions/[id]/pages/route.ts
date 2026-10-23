import { ownedSession, readImage } from "@/lib/server/api";
import { acceptPage } from "@/lib/server/uploadPage";
import { logActivity } from "@/lib/server/activity";

export const maxDuration = 300;

// Desktop "upload from files".
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const image = await readImage(req);
  if ("error" in image) return image.error;
  await logActivity(r.store, r.session.parentId, { kind: "photo_upload", childId: r.session.childId, detail: { via: "computer" } });
  return acceptPage(r.store, r.session, image);
}
