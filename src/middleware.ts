import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseEnv";

// Keeps the Supabase login session fresh. Does nothing in demo mode.
export async function middleware(request: NextRequest) {
  const url = SUPABASE_URL;
  const anon = SUPABASE_ANON_KEY;
  // A sign-in code that lands on any other page (Supabase falls back to the site address when the callback
  // isn't in its allowed list) is passed on to the callback, which finishes signing in.
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname !== "/auth/callback" && !request.nextUrl.pathname.startsWith("/api/")) {
    const to = new URL("/auth/callback", request.url);
    to.searchParams.set("code", code);
    return NextResponse.redirect(to);
  }
  let response = NextResponse.next({ request });
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Refreshes the sign-in when needed; getClaims() verifies the token locally where it can, which is faster than getUser().
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|worksheets/|snap/|api/snap/).*)"],
};
