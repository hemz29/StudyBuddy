import { NextResponse } from "next/server";
import { ownedSession } from "@/lib/server/api";
import { noteWritingDone } from "@/lib/server/activity";

// "I've finished writing": stops the worksheet timer.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  await noteWritingDone(r.store, r.session);
  return NextResponse.json({ ok: true });
}
