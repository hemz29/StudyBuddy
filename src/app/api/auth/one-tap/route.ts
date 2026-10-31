import { NextResponse } from "next/server";
import { isDemo, supabaseServer } from "@/lib/server/context";

// Google One Tap: the home page sends Google's sign-in token here, and Supabase signs this browser in with it.
export async function POST(req: Request) {
  if (isDemo) return NextResponse.json({ ok: false }, { status: 400 });
  const { credential, nonce } = (await req.json().catch(() => ({}))) as { credential?: string; nonce?: string };
  if (!credential) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await (await supabaseServer()).auth.signInWithIdToken({ provider: "google", token: credential, nonce });
  if (error) {
    console.warn("one tap sign-in failed", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
