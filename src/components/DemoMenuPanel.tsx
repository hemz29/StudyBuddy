"use client";
import { useSearchParams } from "next/navigation";

const NOTE: Record<string, string> = {
  reset: "Demo data reset.",
  failed: "That didn't work. Please try again.",
  local: "Switching accounts needs Supabase (not available in local demo mode).",
};

// The menu itself: a small pill that opens a list of roles. Each choice posts to /api/demo.
export function DemoMenuPanel({ role, running, back }: { role: string; running: boolean; back: string }) {
  const note = NOTE[useSearchParams().get("demo") ?? ""];
  const choice = (value: string, label: string, sub: string) => (
    <form action="/api/demo" method="post">
      <input type="hidden" name="do" value={value} />
      <input type="hidden" name="back" value={back} />
      <button className="flex w-full flex-col items-start rounded-xl px-3 py-2 text-left hover:bg-accent-soft">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted">{sub}</span>
      </button>
    </form>
  );
  return (
    <details className="no-print fixed bottom-5 left-5 z-30" open={Boolean(note) || undefined}>
      <summary
        title="Owner tools: switch demo role"
        className={`flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-[0.12em] shadow-lg transition hover:scale-105 ${running ? "bg-[var(--brand-yellow)] text-black" : "bg-black text-[var(--brand-yellow)]"}`}
      >
        DEMO{running && <span className="font-semibold tracking-normal">· {role}</span>} <span aria-hidden>▴</span>
      </summary>
      <div className="absolute bottom-12 left-0 w-72 rounded-2xl border border-line bg-white p-2 text-ink shadow-xl">
        {note && <p className="mb-1 rounded-xl bg-accent-soft px-3 py-2 text-xs">{note}</p>}
        {choice("guest", "Guest (fresh)", "A brand-new guest, as a first-time family sees it")}
        {choice("parent", "Demo parent", "Arjun's family, with 3 weeks of practice")}
        {choice("reset", "Reset demo data", "Rebuild Arjun and the dummy families from scratch")}
        {running && choice("me", "Back to me (Admin)", "End the demo and sign in as yourself")}
        <p className="px-3 pt-1 text-[11px] text-muted">Demo accounts are kept out of your real statistics.</p>
      </div>
    </details>
  );
}
