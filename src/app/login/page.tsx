import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isDemo, supabaseServer } from "@/lib/server/context";
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

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; email?: string }> }) {
  if (isDemo) redirect("/profiles");
  const { sent, error, email = "" } = await searchParams;
  const problem = error ? friendly(error, email || "your email") : null;

  return (
    <main className="min-h-screen bg-bg lg:grid lg:grid-cols-[1.15fr_1fr]">
      <div className="relative h-56 sm:h-72 lg:h-auto">
        <Image src="/art/sign-in.webp" alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-left" />
      </div>
      <div className="flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Image src="/brand/nudi-logo.webp" alt="Nudi – Kannada, with confidence" width={900} height={711} priority className="w-56 rounded-3xl shadow-sm" />
          <h1 className="mt-8 text-4xl leading-tight">Learn Kannada.<br />Build confidence.</h1>
          <p className="mt-3 text-lg text-muted">Grade 6 Kannada (3rd language) practice for your child, with progress you can follow.</p>
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
              <form action={sendLink} className="flex flex-col gap-3">
                <label htmlFor="email" className="font-bold">Parent email</label>
                <input id="email" name="email" type="email" required defaultValue={email} autoComplete="email" className="h-12 rounded-xl border border-line bg-white px-4 text-lg" placeholder="you@example.com" />
                {problem && <p className={problem.wait ? "rounded-xl bg-accent-soft p-3 text-ink" : "text-bad"}>{problem.text}</p>}
                <SendButton waitSeconds={problem?.wait ?? 0} />
                <p className="text-sm text-muted">No password needed. We only use your email to sign you in.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
