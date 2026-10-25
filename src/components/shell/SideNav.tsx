"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KnText } from "@/components/Word";

export const CHILD_NAV = [
  { href: "/learn", label: "Learn", exact: true, also: ["/learn/lesson", "/learn/grammar", "/learn/cards/", "/learn/letters", "/learn/scores"] },
  { href: "/learn/practice", label: "Practice", also: ["/learn/writing", "/learn/tests", "/learn/worksheet/", "/learn/session/"] },
  { href: "/learn/future", label: "Future plans" },
  { href: "/learn/about", label: "About us", also: ["/learn/contact"] },
];

type NavItem = { href: string; label: string; exact?: boolean; also?: string[] };

export function SideNav({ items = CHILD_NAV }: { items?: NavItem[] }) {
  const path = usePathname();
  const active = (i: NavItem) =>
    (i.exact ? path === i.href : path.startsWith(i.href)) || ("also" in i && (i.also ?? []).some((p) => path.startsWith(p)));
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition ${
            active(i) ? "border-[var(--brand-yellow)] bg-accent-soft text-ink" : "border-transparent text-muted hover:bg-white hover:text-ink"
          }`}
        >
          <KnText text={i.label} mode="subtle" />
        </Link>
      ))}
    </nav>
  );
}
