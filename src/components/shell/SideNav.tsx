"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KnText } from "@/components/Word";

export const CHILD_NAV = [
  {
    href: "/learn",
    label: "Learn",
    icon: "📚",
    exact: true,
    also: ["/learn/lesson", "/learn/grammar", "/learn/cards/", "/learn/writing", "/learn/tests", "/learn/letters", "/learn/worksheet/", "/learn/session/"],
  },
  { href: "/learn/about", label: "About us", icon: "🌱" },
  { href: "/learn/contact", label: "Contact us", icon: "✉️" },
  { href: "/learn/future", label: "Future forward", icon: "🚀" },
];

type NavItem = { href: string; label: string; icon: string; exact?: boolean; also?: string[] };

export function SideNav({ items = CHILD_NAV }: { items?: NavItem[] }) {
  const path = usePathname();
  const active = (i: NavItem) =>
    (i.exact ? path === i.href : path.startsWith(i.href)) || ("also" in i && (i.also ?? []).some((p) => path.startsWith(p)));
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
