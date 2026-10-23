import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isDemo, supabaseServer } from "@/lib/server/context";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseEnv";
import { SendButton } from "./SendButton";

export const dynamic = "force-dynamic";

// Supabase's messages, in words a parent can act on.
function friendly(message: string, email: string) {
  const wait = message.match(/after (\d+) seconds?/);
  if (wait) return { text: `We've just sent a link to ${email}. Please check your inbox and spam folder. You can ask for another one in a minute.`, wait: Number(wait[1]) };
  if (/rate limit/i.test(message)) return { text: "Too many sign-in emails were sent in the last hour. Please try again a little later.", wait: 0 };
  if (/invalid.*email|email.*invalid/i.test(message)) return { text: "That email address doesn't look right. Please check it and try again.", wait: 0 };
  return { text: message, wait: 0 };
}

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=Please+enter+your+email");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await (await supabaseServer()).auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  const q = new URLSearchParams({ email });
  if (error) q.set("error", error.message);
  else q.set("sent", "1");
  redirect(`/login?${q}`);
}

// Google sign-in: Supabase sends the parent to Google and back to /auth/callback.
async function googleSignIn() {
  "use server";
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await (await supabaseServer()).auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback` } });
  if (error || !data.url) redirect(`/login?error=${encodeURIComponent(error?.message ?? "Google sign-in isn't available right now.")}`);
  redirect(data.url);
}

// The Google button shows only once Google is switched on in Supabase, so no parent meets a half-set-up sign-in.
async function googleEnabled() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY! }, next: { revalidate: 60 } });
    return Boolean((await res.json()).external?.google);
  } catch {
    return false;
  }
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; email?: string }> }) {
  if (isDemo) redirect("/profiles");
  const { sent, error, email = "" } = await searchParams;
  const problem = error ? friendly(error, email || "your email") : null;
  const google = await googleEnabled();

  return (
    <main className="min-h-screen bg-bg lg:grid lg:grid-cols-[1.15fr_1fr]">
      <div className="relative h-56 sm:h-72 lg:h-auto">
        <Image src="/art/sign-in.webp" alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-left" />
      </div>
      <div className="flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Image src="/brand/nudi-logo.webp" alt="Nudi – Kannada, with confidence" width={900} height={711} priority className="mx-auto w-56 rounded-3xl shadow-sm" />
          <p className="mt-6 text-center text-lg text-muted">Kannada practice for your child, with progress you can follow.</p>
          <div className="card mt-8 p-6">
            {sent ? (
              <div className="flex flex-col gap-2">
                <p className="text-4xl">📬</p>
                <h2 className="text-2xl">Check your email</h2>
                <p className="text-muted">
                  We sent a sign-in link to {email ? <b className="text-ink">{email}</b> : "your email"}. Open it on this device to continue. It can take a minute to arrive; check spam too.
                </p>
                <a href="/login" className="mt-2 text-sm font-bold text-accent">Use a different email</a>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <form action={sendLink} className="flex flex-col gap-3">
                  <label htmlFor="email" className="font-bold">Parent email</label>
                  <input id="email" name="email" type="email" required defaultValue={email} autoComplete="email" className="h-12 rounded-xl border border-line bg-white px-4 text-lg" placeholder="you@example.com" />
                  {problem && <p className={problem.wait ? "rounded-xl bg-accent-soft p-3 text-ink" : "text-bad"}>{problem.text}</p>}
                  <SendButton waitSeconds={problem?.wait ?? 0} />
                  <p className="text-sm text-muted">No password needed. We only use your email to sign you in.</p>
                </form>
                {google && (
                  <>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
                    </div>
                    <form action={googleSignIn}>
                      <button className="btn w-full border border-[#747775] bg-white text-ink shadow-sm hover:bg-gray-50">
                        <GoogleLogo /> Continue with Google
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-sm"><a href="/privacy" className="text-muted underline">Privacy</a></p>
        </div>
      </div>
    </main>
  );
}
