import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireParent, supabaseServer, userStore } from "@/lib/server/context";
import { leaveGuest } from "@/lib/server/signOut";
import { googleEnabled } from "@/lib/server/google";
import { GoogleLogo } from "@/components/GoogleLogo";
import { LogoMark } from "@/components/shell/Logo";

export const dynamic = "force-dynamic";

// Turns a guest into a full account. Supabase keeps the same user, so every child and all their progress stay.
async function saveWithEmail(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/save?error=Please+enter+your+email");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await (await supabaseServer()).auth.updateUser({ email }, { emailRedirectTo: `${origin}/auth/callback?next=/parent` });
  redirect(error ? `/save?error=${encodeURIComponent(error.message)}` : `/save?sent=${encodeURIComponent(email)}`);
}

async function saveWithGoogle() {
  "use server";
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await (await supabaseServer()).auth.linkIdentity({ provider: "google", options: { redirectTo: `${origin}/auth/callback?next=/parent` } });
  if (error || !data.url) redirect(`/save?error=${encodeURIComponent(error?.message ?? "Google isn't available right now.")}`);
  redirect(data.url);
}

export default async function Save({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const parent = await requireParent();
  if (!parent.isGuest) redirect("/parent");
  const { sent, error } = await searchParams;
  const google = await googleEnabled();
  const names = (await (await userStore()).listChildren(parent.id)).map((c) => c.nickname);
  const who = names.length ? names.join(" and ") : "the guest profile";

  return (
    <main className="app-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="card flex w-full max-w-md flex-col gap-4 p-6 sm:p-8">
        <LogoMark size={44} />
        <h1 className="text-2xl">Save your child&apos;s progress</h1>
        <p className="text-muted">
          Add your email or Google account so you can come back on any device. Everything practised so far stays, and we only use your email to sign you in.
        </p>
        {sent ? (
          <p className="rounded-xl bg-accent-soft p-4">
            We sent a link to <b>{sent}</b>. Open it to finish saving. Until then you can keep practising as before.
          </p>
        ) : (
          <>
            {google && (
              <form action={saveWithGoogle}>
                <button className="btn w-full border border-[#747775] bg-white text-ink"><GoogleLogo /> Continue with Google</button>
              </form>
            )}
            <form action={saveWithEmail} className="flex flex-col gap-3">
              <label htmlFor="email" className="font-bold">Parent email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className="h-12 rounded-xl border border-line bg-white px-4 text-lg" placeholder="you@example.com" />
              <button className="btn btn-primary">Save with email</button>
            </form>
            {error && <p className="text-bad">{error}</p>}
          </>
        )}
        <Link href="/learn" className="text-center text-sm text-muted underline">Not now, keep practising</Link>

        {/* For a parent who already has an account and started as a guest by mistake (or on a shared device). */}
        <section id="switch" className="scroll-mt-6 border-t border-line pt-4">
          <h2 className="text-lg font-bold">Already have an account?</h2>
          <p className="mt-1 text-sm text-muted">Sign in with your email or Google account instead.</p>
          <p className="mt-2 rounded-xl bg-warn-soft p-3 text-sm text-warn">
            <b>{who}</b> on this device {names.length > 1 ? "were" : "was"} started as a guest. After you leave, {names.length > 1 ? "their" : "this"} progress can&apos;t be opened again, unless you save it above first.
          </p>
          <form action={leaveGuest} className="mt-3 flex flex-col gap-3">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="understood" required className="mt-0.5 h-4 w-4 accent-black" />
              I understand {who}&apos;s guest progress will be lost.
            </label>
            <button className="btn btn-ghost">Leave guest mode and sign in</button>
          </form>
        </section>
      </div>
    </main>
  );
}
