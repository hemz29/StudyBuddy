import { NextResponse } from "next/server";
import { getWorksheet } from "@/content";
import { getParent, userStore } from "@/lib/server/context";
import { logActivity } from "@/lib/server/activity";

// Notes the download for the admin page, then hands over the worksheet's ready-made PDF.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getWorksheet(id)) return new Response("Not found", { status: 404 });
  const parent = await getParent();
  if (parent) await logActivity(await userStore(), parent.id, { kind: "worksheet_download", path: `/worksheets/${id}.pdf`, detail: { worksheetId: id } });
  return NextResponse.redirect(new URL(`/worksheets/${id}.pdf`, req.url));
}
