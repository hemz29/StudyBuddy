import Link from "next/link";
import { requireChild, isDemo } from "@/lib/server/context";
import { AvatarImage } from "@/components/AvatarImage";
import { Logo } from "@/components/shell/Logo";
import { SideNav } from "@/components/shell/SideNav";
import { LineIcon } from "@/components/LineIcon";
import { ActivityPing } from "@/components/ActivityPing";
import { SaveProgressStrip } from "@/components/SaveProgressStrip";
import { SignOutButton } from "@/components/SignOutButton";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const { parent, child } = await requireChild();
  return (
    <div className="app-bg min-h-screen">
      <ActivityPing />
      {/* The same header as the home page: logo on the left, the menu across the top, the learner and account on the right. */}
      <header className="no-print border-b border-line bg-bg/95 backdrop-blur lg:sticky lg:top-0 lg:z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Logo />
          <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1"><SideNav /></div>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/profiles" title="Switch learner" className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-sm font-medium hover:border-black">
              <AvatarImage avatar={child.theme} size={30} /> {child.nickname}
            </Link>
            <Link href="/parent" title="Parent view" className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-ink"><LineIcon name="family" size={18} className="inline align-[-3px] sm:mr-1.5" /><span className="hidden sm:inline">Parent view</span></Link>
            <SignOutButton isGuest={parent.isGuest} className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-ink" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <main className="min-w-0 pb-16">
          {isDemo && <p className="no-print mb-3 text-xs text-muted">Demo mode – progress is saved on this computer only.</p>}
          {parent.isGuest && <div className="mb-4"><SaveProgressStrip name={child.nickname} /></div>}
          {children}
        </main>
      </div>
    </div>
  );
}
