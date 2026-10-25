"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "./context";

// Sign-in actions for the home page's sign-in card. Results come back to "/" so the card can show them.
const back = (q: URLSearchParams) => redirect(`/?${q}#signin`);

export async function sendLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) back(new URLSearchParams({ error: "Please enter your email" }));
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await (await supabaseServer()).auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback` } });
  const q = new URLSearchParams({ email, mode: String(formData.get("mode") ?? "signin") });
  if (error) q.set("error", error.message);
  else q.set("sent", "1");
  back(q);
}

// Google sign-in: Supabase sends the parent to Google and back to /auth/callback.
export async function googleSignIn() {
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await (await supabaseServer()).auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback` } });
  if (error || !data.url) back(new URLSearchParams({ error: error?.message ?? "Google sign-in isn't available right now." }));
  redirect(data!.url!);
}
