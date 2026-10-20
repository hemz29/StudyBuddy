import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isDemo, supabaseServer } from "@/lib/server/context";

export const dynamic = "force-dynamic";

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=Please+enter+your+email");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await (await supabaseServer()).auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  redirect(error ? `/login?error=${encodeURIComponent(error.message)}` : "/login?sent=1");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  if (isDemo) redirect("/profiles");
  const { sent, error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-extrabold">StudyBuddy Kannada</h1>
      <p className="mt-2 text-muted">Grade 6 Kannada (3rd language) practice for your child, with progress you can follow.</p>
      <div className="card mt-8 p-6">
        {sent ? (
          <>
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="mt-2 text-muted">We sent you a sign-in link. Open it on this device to continue.</p>
          </>
        ) : (
          <form action={sendLink} className="flex flex-col gap-3">
            <label htmlFor="email" className="font-bold">Parent email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="h-12 rounded-xl border border-line px-4 text-lg" placeholder="you@example.com" />
            {error && <p className="text-bad">{error}</p>}
            <button className="btn btn-primary mt-2">Email me a sign-in link</button>
            <p className="text-sm text-muted">No password needed. We only use your email to sign you in.</p>
          </form>
        )}
      </div>
    </main>
  );
}
