import { ownedSession, readImage } from "@/lib/server/api";
import { acceptPage } from "@/lib/server/uploadPage";

export const maxDuration = 300;

// Desktop "upload from files".
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const image = await readImage(req);
  if ("error" in image) return image.error;
  return acceptPage(r.store, r.session, image);
}
