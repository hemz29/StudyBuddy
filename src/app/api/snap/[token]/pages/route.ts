import { fail, readImage } from "@/lib/server/api";
import { acceptPage } from "@/lib/server/uploadPage";
import { resolveToken } from "@/lib/server/snap";
import { logActivity } from "@/lib/server/activity";

export const maxDuration = 300;

// Phone upload, authorised by the QR link instead of a login.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const r = await resolveToken((await params).token);
  if (!r) return fail(404, "This link has expired. Scan the QR code on the computer again.");
  const image = await readImage(req);
  if ("error" in image) return image.error;
  await logActivity(r.store, r.session.parentId, { kind: "photo_upload", childId: r.session.childId, detail: { via: "qr" } });
  return acceptPage(r.store, r.session, image);
}
