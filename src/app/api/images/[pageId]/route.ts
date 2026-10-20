import { getParent, userStore } from "@/lib/server/context";
import { fail } from "@/lib/server/api";

// Serves a page photo to the parent who owns it (used for handwriting strips and the dashboard).
export async function GET(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const parent = await getParent();
  if (!parent) return fail(401, "Please sign in again.");
  const sessionId = new URL(req.url).searchParams.get("session") ?? "";
  const { pageId } = await params;
  const store = await userStore();
  const page = (await store.listPages(parent.id, sessionId)).find((p) => p.id === pageId);
  if (!page) return fail(404, "Not found");
  const data = await store.getImage(page.imageKey);
  if (!data) return fail(404, "Not found");
  const type = page.imageKey.endsWith(".png") ? "image/png" : page.imageKey.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(data), { headers: { "content-type": type, "cache-control": "private, max-age=3600" } });
}
