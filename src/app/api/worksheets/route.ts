import { NextResponse } from "next/server";
import { WORKSHEETS } from "@/content";

export function GET() {
  return NextResponse.json(WORKSHEETS.map((w) => w.id));
}
