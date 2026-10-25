import { Wordmark } from "@/components/shell/Logo";
import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isDemo, supabaseServer } from "@/lib/server/context";
import { googleEnabled } from "@/lib/server/google";
import { GoogleLogo } from "@/components/GoogleLogo";
import { SendButton } from "./SendButton";
import { HashError } from "./HashError";
import { LineIcon } from "@/components/LineIcon";

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
          <div className="flex justify-center"><Wordmark size={64} /></div>
          <p className="mt-6 text-center text-lg text-muted">Kannada practice for your child, with progress you can follow.</p>
          <div className="card mt-8 p-6">
            {sent ? (
              <div className="flex flex-col gap-2">
                <LineIcon name="mail" size={40} />
                <h2 className="text-2xl">Check your email</h2>
                <p className="text-muted">
                  We sent a sign-in link to {email ? <b className="text-ink">{email}</b> : "your email"}. Open it on this device to continue. It can take a minute to arrive; check spam too.
                </p>
                <a href="/login" className="mt-2 text-sm font-bold text-accent">Use a different email</a>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <HashError />
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
