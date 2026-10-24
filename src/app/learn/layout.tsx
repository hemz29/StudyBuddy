import Link from "next/link";
import { requireChild, isDemo } from "@/lib/server/context";
import { AvatarImage } from "@/components/AvatarImage";
import { Logo } from "@/components/shell/Logo";
import { SideNav } from "@/components/shell/SideNav";
import { LineIcon } from "@/components/LineIcon";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const { child } = await requireChild();
  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:py-6">
        <aside className="no-print flex flex-col gap-4 rounded-[var(--radius)] bg-white/75 p-3 shadow-sm backdrop-blur-md lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-64 lg:shrink-0">
          <div className="flex items-center justify-between lg:px-2 lg:pt-1">
            <Logo />
            <Link href="/profiles" className="flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-sm font-bold lg:hidden">
              <AvatarImage avatar={child.theme} size={32} /> {child.nickname}
            </Link>
          </div>
          <SideNav />
          <div className="mt-auto hidden flex-col gap-2 lg:flex">
            <Link href="/profiles" className="card flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
              <AvatarImage avatar={child.theme} size={48} />
              <span className="flex flex-col">
                <span className="font-extrabold">{child.nickname}</span>
                <span className="text-xs text-muted">Switch learner</span>
              </span>
            </Link>
            <Link href="/parent" className="rounded-2xl px-4 py-2 text-sm font-bold text-muted hover:bg-white/70 hover:text-ink"><LineIcon name="family" size={18} className="mr-1.5 inline align-[-3px]" />Parent view</Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">
          {isDemo && <p className="no-print mb-3 text-xs text-muted">Demo mode – progress is saved on this computer only.</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
