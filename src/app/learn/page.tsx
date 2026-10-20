import Link from "next/link";
import { LESSONS, WORKSHEETS } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";

export default async function LearnHome() {
  const { parent, child } = await requireChild();
  const sessions = await (await userStore()).listSessions(parent.id, child.id);
  const done = new Map<string, number>();
  for (const s of sessions) if (s.status === "graded" && s.kind === "worksheet") done.set(s.worksheetId, (done.get(s.worksheetId) ?? 0) + 1);
  const open = sessions.filter((s) => s.kind === "worksheet" && s.status !== "graded").sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <div className="flex flex-col gap-8">
      {open[0] && (
        <Link href={`/learn/session/${open[0].id}`} className="card flex items-center justify-between gap-4 border-accent p-5">
          <div>
            <p className="text-sm font-bold text-muted">Continue where you stopped</p>
            <p className="text-lg font-extrabold">{WORKSHEETS.find((w) => w.id === open[0].worksheetId)?.title.en}</p>
          </div>
          <span className="btn btn-primary">Continue</span>
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-2xl font-extrabold" style={{ color: "var(--header-ink)" }}>1. Read a lesson</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {LESSONS.map((l) => (
            <Link key={l.id} href={`/learn/lesson/${l.id}`} className="card flex flex-col gap-1 p-5 transition hover:-translate-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">{l.kind === "poem" ? "Poem" : "Lesson"}</span>
              <span className="kn text-2xl font-bold">{l.title.kn}</span>
              <span className="text-muted">{l.title.en}</span>
              <span className="mt-3 text-sm font-bold text-accent">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-extrabold" style={{ color: "var(--header-ink)" }}>2. Quick practice cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {LESSONS.map((l) => (
            <Link key={l.id} href={`/learn/cards/${l.id}`} className="card flex items-center justify-between p-5 transition hover:-translate-y-0.5">
              <span>
                <span className="kn block text-lg font-bold">{l.title.kn}</span>
                <span className="text-sm text-muted">Opposites, plurals, gender, meanings</span>
              </span>
              <span className="text-2xl">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-extrabold" style={{ color: "var(--header-ink)" }}>3. Write a worksheet by hand</h2>
        <p className="mb-3 text-sm opacity-80" style={{ color: "var(--header-ink)" }}>Print it, write your answers on paper, then take a photo with a phone.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {WORKSHEETS.map((w) => (
            <Link key={w.id} href={`/learn/worksheet/${w.id}`} className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5">
              <span>
                <span className="block text-lg font-extrabold">{w.title.en}</span>
                <span className="kn block text-muted">{w.title.kn}</span>
                <span className="text-sm text-muted">{w.totalMarks} marks</span>
              </span>
              {done.get(w.id) ? <span className="chip bg-good-soft text-good">Done ×{done.get(w.id)}</span> : <span className="chip bg-accent-soft">New</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
