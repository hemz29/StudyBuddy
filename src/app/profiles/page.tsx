import Link from "next/link";
import { redirect } from "next/navigation";
import { isDemo, requireParent, setActiveChild, userStore } from "@/lib/server/context";
import { THEMES, type Theme } from "@/lib/store/types";
import { ThemeMascot } from "@/components/ThemeArt";
import { ThemePicker } from "@/components/ThemePicker";
import { DemoBanner } from "@/components/DemoBanner";

async function addChild(formData: FormData) {
  "use server";
  const parent = await requireParent();
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 40);
  const theme = String(formData.get("theme")) as Theme;
  if (!nickname || !THEMES.includes(theme)) redirect("/profiles?error=1");
  const child = await (await userStore()).createChild(parent.id, nickname, theme);
  await setActiveChild(child.id);
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      {isDemo && <DemoBanner />}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Who is practising today?</h1>
        <Link href="/parent" className="btn btn-ghost">Parent dashboard</Link>
      </div>

      {children.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {children.map((c) => (
            <form key={c.id} action={pickChild}>
              <input type="hidden" name="childId" value={c.id} />
              <button data-theme={c.theme} className="card flex w-full flex-col items-center gap-2 p-5 hover:-translate-y-0.5 transition">
                <ThemeMascot theme={c.theme} size={84} />
                <span className="text-xl font-extrabold">{c.nickname}</span>
              </button>
            </form>
          ))}
        </div>
      )}

      <details className="card mt-8 p-6" open={children.length === 0}>
        <summary className="cursor-pointer text-xl font-bold">Add a child</summary>
        <form action={addChild} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-bold">Nickname</span>
            <span className="text-sm text-muted">A first name or nickname is enough. We don&apos;t need a full name or date of birth.</span>
            <input name="nickname" required maxLength={40} className="h-12 rounded-xl border border-line px-4 text-lg" />
          </label>
          <ThemePicker />
          {error && <p className="text-bad">Please enter a nickname and choose a theme.</p>}
          <button className="btn btn-primary self-start">Start learning</button>
        </form>
      </details>
    </main>
  );
}
