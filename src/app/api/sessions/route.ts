import { NextResponse } from "next/server";
import { z } from "zod";
import { MARKING, getWorksheet } from "@/content";
import { getActiveChild, getParent, userStore } from "@/lib/server/context";
import { fail } from "@/lib/server/api";
import { logActivity } from "@/lib/server/activity";

const Body = z.object({ worksheetId: z.string(), retryOf: z.string().nullable().optional() });

// Starts a handwritten worksheet attempt for the active child.
export async function POST(req: Request) {
  const parent = await getParent();
  if (!parent) return fail(401, "Please sign in again.");
  const child = await getActiveChild(parent.id);
  if (!child) return fail(400, "Choose who is practising first.");
  const body = Body.safeParse(await req.json());
  const ws = body.success ? getWorksheet(body.data.worksheetId) : undefined;
  if (!body.success || !ws || ws.retired) return fail(400, "Unknown worksheet.");

  const store = await userStore();
  const retryOf = body.data.retryOf && (await store.getSession(parent.id, body.data.retryOf)) ? body.data.retryOf : null;
  const session = await store.createSession({
    parentId: parent.id,
    childId: child.id,
    kind: "worksheet",
    worksheetId: body.data.worksheetId,
    retryOf,
    status: "writing",
    markingVersion: MARKING.version,
    help: {},
    awarded: null,
    max: null,
    completedAt: null,
  });
  await logActivity(store, parent.id, { kind: "worksheet_start", path: `/learn/worksheet/${ws.id}`, childId: child.id });
  return NextResponse.json({ id: session.id });
}
