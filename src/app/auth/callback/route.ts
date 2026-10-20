import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/server/context";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const { error } = await (await supabaseServer()).auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL("/profiles", request.url));
}
