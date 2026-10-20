import { NextResponse } from "next/server";
import { ownedSession } from "@/lib/server/api";

// Polled by the desktop while photos are read, and used to render checking and results.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const [pages, attempts] = await Promise.all([
    r.store.listPages(r.parent.id, r.session.id),
    r.store.listSessionAttempts(r.parent.id, r.session.id),
  ]);
  return NextResponse.json({ session: r.session, pages, attempts });
}
