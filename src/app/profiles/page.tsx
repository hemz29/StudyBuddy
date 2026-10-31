import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { DemoMenu } from "@/components/DemoMenu";
import { isDemo, requireParent, setActiveChild, userStore } from "@/lib/server/context";
import { AVATARS } from "@/lib/avatars";
import { AvatarImage } from "@/components/AvatarImage";
import { AvatarPicker } from "@/components/AvatarPicker";
import { Logo } from "@/components/shell/Logo";
import { DemoBanner } from "@/components/DemoBanner";
import { LineIcon } from "@/components/LineIcon";

async function addChild(formData: FormData) {
  "use server";
  const parent = await requireParent();
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 40);
  const avatar = String(formData.get("avatar"));
  if (!nickname || !(avatar in AVATARS)) redirect("/profiles?error=1");
  let childId: string;
  try {
    childId = (await (await userStore()).createChild(parent.id, nickname, avatar)).id;
  } catch (e) {
    // Production hides server errors behind a digest, so show the database's message to the parent instead.
    console.error("addChild failed", e);
    redirect(`/profiles?error=${encodeURIComponent(e instanceof Error ? e.message : String(e)).slice(0, 300)}`);
  }
  await setActiveChild(childId);
  redirect("/learn");
}

async function pickChild(formData: FormData) {
  "use server";
  const parent = await requireParent();
  const id = String(formData.get("childId"));
  if (await (await userStore()).getChild(parent.id, id)) await setActiveChild(id);
  redirect("/learn");
}

export default async function Profiles({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const parent = await requireParent();
  const children = await (await userStore()).listChildren(parent.id);
  const { error } = await searchParams;

  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-auto"><Logo /></span>
          <Link href="/parent" className="btn btn-ghost"><LineIcon name="family" size={18} />Parent view</Link>
          <DemoMenu back="/profiles" />
          <SignOutButton isGuest={parent.isGuest} className="btn btn-ghost" />
        </div>
        {isDemo && <div className="mt-4"><DemoBanner /></div>}
        <h1 className="mt-8 text-4xl">Who is practising today?</h1>

        {children.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {children.map((c) => (
              <form key={c.id} action={pickChild}>
                <input type="hidden" name="childId" value={c.id} />
                <button className="card flex w-full flex-col items-center gap-2 bg-white p-5 transition hover:-translate-y-0.5">
                  <AvatarImage avatar={c.theme} size={112} />
                  <span className="text-xl font-extrabold">{c.nickname}</span>
                </button>
              </form>
            ))}
          </div>
        )}

        <details className="card mt-8 bg-white p-6" open={children.length === 0}>
          <summary className="cursor-pointer text-xl font-bold">Add a child</summary>
          <form action={addChild} className="mt-4 flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              <span className="font-bold">Nickname</span>
              <span className="text-sm text-muted">A first name or nickname is enough. We don&apos;t need a full name or date of birth.</span>
              <input name="nickname" required maxLength={40} className="h-12 rounded-xl border border-line bg-white px-4 text-lg" />
            </label>
            <AvatarPicker />
            {error === "1" && <p className="text-bad">Please enter a nickname and choose an avatar.</p>}
            {error && error !== "1" && <p className="text-bad">Couldn&apos;t save the child. Please send this message to the Kali Kannada team: <b>{error}</b></p>}
            <button className="btn btn-primary self-start">Start learning</button>
          </form>
        </details>
      </div>
    </main>
  );
}
