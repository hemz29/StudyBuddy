import { NextResponse } from "next/server";
import { getWorksheet } from "@/content";
import { resolveToken } from "@/lib/server/snap";
import { fail } from "@/lib/server/api";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const r = await resolveToken((await params).token);
  if (!r) return fail(404, "This link has expired. Scan the QR code on the computer again.");
  const pages = await r.store.listPages(r.session.parentId, r.session.id);
  return NextResponse.json({
    nickname: r.child.nickname,
    avatar: r.child.theme,
    worksheet: getWorksheet(r.session.worksheetId)?.title,
    pages: pages.map((p) => ({ id: p.id, status: p.status, error: p.error })),
    graded: r.session.status === "graded",
  });
}
