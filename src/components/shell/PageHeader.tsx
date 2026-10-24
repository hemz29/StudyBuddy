import Link from "next/link";

export function PageHeader({ title, sub, back = "/learn" }: { title: React.ReactNode; sub?: React.ReactNode; back?: string | null }) {
  return (
    <header className="mb-5">
      {back && <Link href={back} className="text-sm font-bold text-accent">← Back</Link>}
      <h1 className="mt-1 text-3xl text-ink">{title}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </header>
  );
}

// White choice card, its colour kept to the icon chip and arrow, used across the child's pages.
const TONES = {
  sage: "[--tone:var(--accent-soft)] [--tone-ink:var(--accent)]",
  peach: "[--tone:var(--peach)] [--tone-ink:var(--peach-ink)]",
  lavender: "[--tone:var(--lavender)] [--tone-ink:var(--lavender-ink)]",
  sky: "[--tone:var(--sky)] [--tone-ink:var(--sky-ink)]",
} as const;
export type Tone = keyof typeof TONES;

export function ChoiceCard({ href, tone, icon, eyebrow, title, sub, badge, children }: {
  // Without an href the card is a "coming soon" tile: greyed, not clickable.
  href?: string; tone: Tone; icon?: React.ReactNode; eyebrow?: string; title: React.ReactNode; sub?: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <Wrap href={href} className={`group flex flex-col gap-2 card p-4 sm:p-5 ${href ? "transition hover:-translate-y-0.5 hover:shadow-md" : "opacity-60"} ${TONES[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        {icon && <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--tone)] text-xl text-[var(--tone-ink)]">{icon}</span>}
        {eyebrow && <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">{eyebrow}</span>}
        {badge}
      </div>
      <span className="serif text-lg font-semibold text-ink">{title}</span>
      {sub && <span className="text-sm text-muted">{sub}</span>}
      {children}
      {href ? (
        <span className="mt-auto text-lg font-bold text-[var(--tone-ink)] transition group-hover:translate-x-1">→</span>
      ) : (
        <span className="mt-auto self-start rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-muted">Coming soon</span>
      )}
    </Wrap>
  );
}

function Wrap({ href, className, children }: { href?: string; className: string; children: React.ReactNode }) {
  return href ? <Link href={href} className={className}>{children}</Link> : <div className={className} aria-disabled>{children}</div>;
}
