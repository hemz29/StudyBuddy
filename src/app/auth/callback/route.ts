import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/server/context";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  // Where to go afterwards: only a path on this site (a guest saving their account returns to the parent page).
  const next = request.nextUrl.searchParams.get("next");
  const to = next && /^\/[a-z]/.test(next) ? next : "/profiles";
  if (code) {
    const { error } = await (await supabaseServer()).auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}#signin`, request.url));
  }
  return NextResponse.redirect(new URL(to, request.url));
}
