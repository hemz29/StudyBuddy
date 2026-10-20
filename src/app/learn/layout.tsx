import Link from "next/link";
import { requireChild, isDemo } from "@/lib/server/context";
import { ThemeMascot } from "@/components/ThemeArt";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const { child } = await requireChild();
  return (
    <div data-theme={child.theme} className="min-h-screen bg-bg">
      <header className="no-print mx-auto flex max-w-6xl items-center gap-3 px-4 py-4" style={{ color: "var(--header-ink)" }}>
        <Link href="/learn" className="flex items-center gap-3">
          <ThemeMascot theme={child.theme} size={48} />
          <span className="text-xl font-extrabold">Hi {child.nickname}!</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm font-bold">
          <Link href="/learn" className="rounded-full px-3 py-2 hover:bg-white/15">Home</Link>
          <Link href="/learn/letters" className="rounded-full px-3 py-2 hover:bg-white/15">Letters</Link>
          <Link href="/profiles" className="rounded-full px-3 py-2 hover:bg-white/15">Switch</Link>
          <Link href="/parent" className="rounded-full px-3 py-2 hover:bg-white/15">Parent</Link>
        </nav>
      </header>
      {isDemo && <p className="no-print mx-auto max-w-6xl px-4 text-xs opacity-70" style={{ color: "var(--header-ink)" }}>Demo mode – progress is saved on this computer only.</p>}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-2">{children}</main>
    </div>
  );
}
