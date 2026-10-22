"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KnText } from "@/components/Word";

export const CHILD_NAV = [
  { href: "/learn", label: "Home", icon: "🏠", exact: true },
  { href: "/learn/lessons", label: "Read & Understand", icon: "📖", also: ["/learn/lesson/"] },
  { href: "/learn/grammar", label: "Grammar", icon: "✏️", also: ["/learn/cards/"] },
  { href: "/learn/writing", label: "Writing practice", icon: "📝" },
  { href: "/learn/tests", label: "Practice tests", icon: "⭐" },
  { href: "/learn/letters", label: "Letters ಅಕ್ಷರ", icon: "ಅ" },
];

export function SideNav({ items = CHILD_NAV }: { items?: typeof CHILD_NAV }) {
  const path = usePathname();
  const active = (i: (typeof CHILD_NAV)[number]) =>
    i.exact ? path === i.href : path.startsWith(i.href) || (i.also ?? []).some((p) => path.startsWith(p));
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
            active(i) ? "bg-accent-soft text-ink" : "text-muted hover:bg-white/70 hover:text-ink"
          }`}
        >
          <span className="kn w-6 text-center text-base" aria-hidden>{i.icon}</span>
          <KnText text={i.label} mode="subtle" />
        </Link>
      ))}
    </nav>
  );
}
