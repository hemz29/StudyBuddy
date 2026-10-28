import Link from "next/link";
import { getWorksheet } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { skillRows } from "@/lib/dashboard";
import { PageHeader } from "@/components/shell/PageHeader";
import { readiness } from "@/lib/readiness";
import { ReadinessMeter } from "@/components/readiness/ReadinessMeter";

export const metadata = { title: "My scores · Kali Kannada" };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// The child's own view of their progress: a few big numbers, skill bars and every marked worksheet.
export default async function MyScores() {
  const { parent, child } = await requireChild();
  const store = await userStore();
  const [sessions, attempts] = await Promise.all([store.listSessions(parent.id, child.id), store.listChildAttempts(parent.id, child.id)]);
  const graded = sessions
    .filter((s) => s.kind === "worksheet" && s.status === "graded" && s.max)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const pct = (s: (typeof graded)[number]) => Math.round(((s.awarded ?? 0) / (s.max || 1)) * 100);
  const best = graded.length ? Math.max(...graded.map(pct)) : null;
  const fullMarks = attempts.filter((a) => a.awarded !== null && a.awarded === a.max).length;
  const skills = skillRows(attempts).filter((s) => s.pct !== null);
  const ready = readiness(attempts, sessions, child.exam);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <PageHeader title="My scores" sub={`Well done for practising, ${child.nickname}!`} />

      <ReadinessMeter r={ready} audience="child" nickname={child.nickname} />

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Latest" value={graded[0] ? `${pct(graded[0])}%` : "–"} />
        <Stat label="Best" value={best === null ? "–" : `${best}%`} />
        <Stat label="Full-mark answers" value={String(fullMarks)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card flex flex-col gap-3 p-4 sm:p-5">
          <h2 className="text-base font-bold">My skills</h2>
          {skills.length === 0 ? <p className="text-sm text-muted">Finish a worksheet to see your skills.</p> : skills.map((s) => (
            <div key={s.skill} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0">{s.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-accent-soft"><div className="h-full rounded-full bg-black" style={{ width: `${s.pct}%` }} /></div>
              <span className="w-10 text-right font-bold">{s.pct}%</span>
            </div>
          ))}
        </section>

        <section className="card flex flex-col gap-2 p-4 sm:p-5">
          <h2 className="text-base font-bold">My worksheets</h2>
          {graded.length === 0 ? <p className="text-sm text-muted">No marked worksheets yet. <Link href="/learn/practice" className="font-bold underline">Start one</Link></p> : (
            <ul className="flex flex-col divide-y divide-line text-sm">
              {graded.map((s) => (
                <li key={s.id}>
                  <Link href={`/learn/session/${s.id}`} className="flex items-center gap-3 py-2 hover:underline">
                    <span className="flex-1">{getWorksheet(s.worksheetId)?.title.en ?? s.worksheetId}{s.retryOf && <span className="text-muted"> · retry</span>}</span>
                    <span className="text-muted">{new Date(s.completedAt ?? s.startedAt).toLocaleDateString("en-IN")}</span>
                    <span className="w-20 text-right font-bold">{fmt(s.awarded ?? 0)}/{fmt(s.max ?? 0)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-3xl font-light">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
