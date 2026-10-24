import { getActiveChild, getParent, userStore } from "@/lib/server/context";
import { logActivity } from "@/lib/server/activity";

// Page views from ActivityPing: the admin page groups them into visits to show time on the site and repeat visits.
export async function POST(req: Request) {
  const parent = await getParent();
  if (!parent) return new Response(null, { status: 204 });
  const { path } = (await req.json().catch(() => ({}))) as { path?: string };
  const child = await getActiveChild(parent.id);
  await logActivity(await userStore(), parent.id, { kind: "page_view", path: String(path ?? "").slice(0, 200), childId: child?.id ?? null });
  return new Response(null, { status: 204 });
}
