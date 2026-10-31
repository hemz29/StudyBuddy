import Link from "next/link";
import type { Readiness } from "@/lib/readiness";

// What the meter still needs before it can say something useful: the exam date and chapters (set by a parent),
// and some practice. Each step links to where it's done; the list disappears once all three are done.
export function ReadinessSetup({ r, className = "" }: { r: Readiness; className?: string }) {
  const steps = [
    { done: r.exam.date !== null, text: "Set the exam date", who: "Parent view", href: "/parent#exam" },
    { done: r.chaptersChosen, text: "Choose the exam chapters", who: "Parent view", href: "/parent#exam" },
    { done: r.enoughEvidence, text: "Practise: one practice test is enough to start", href: "/learn/tests" },
  ];
  if (steps.every((s) => s.done)) return null;
  return (
    <div className={`rounded-2xl bg-accent-soft p-3 text-sm ${className}`}>
      <p className="font-bold">To fill this in:</p>
      <ol className="mt-1.5 flex flex-col gap-1">
        {steps.map((s) => (
          <li key={s.text}>
            <Link href={s.href} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-white/70">
              <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${s.done ? "bg-black text-[var(--brand-yellow)]" : "border border-black/40"}`}>
                {s.done ? "✓" : ""}
              </span>
              <span className={`flex-1 ${s.done ? "text-muted line-through" : ""}`}>
                {s.text}
                {s.who && !s.done && <span className="text-muted"> ({s.who})</span>}
              </span>
              {!s.done && <span aria-hidden>→</span>}
              <span className="sr-only">{s.done ? "done" : "not done yet"}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-1.5 text-xs text-muted">The meter fills in as you practise.</p>
    </div>
  );
}
