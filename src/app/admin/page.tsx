import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorksheet } from "@/content";
import { requireParent } from "@/lib/server/context";
import { isAdmin, loadAdminData, type Family } from "@/lib/server/admin";
import { writingTime } from "@/lib/time";
import { Logo } from "@/components/shell/Logo";

const ACTIVITY: Record<string, string> = {
  parent_dashboard: "Opened the parent dashboard",
  parent_session_review: "Reviewed a worksheet's answers",
  lesson_view: "Child opened a lesson",
};
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "–");

// The owner's view of the pilot: who joined, who practised, how long sessions took, what parents looked at.
export default async function Admin() {
  const me = await requireParent();
  if (!isAdmin(me.email)) notFound();
  const d = await loadAdminData();

  const familyOf = new Map(d.families.map((f) => [f.parentId, f]));
  const childOf = new Map(d.children.map((c) => [c.id, c]));
  const worksheets = d.sessions.filter((s) => s.kind === "worksheet").sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const finished = worksheets.filter((s) => s.status === "graded");
  const activeWeek = new Set(d.sessions.filter((s) => Date.now() - Date.parse(s.startedAt) < 7 * 864e5).map((s) => s.parentId));
  const hint2 = d.attempts.filter((a) => (a.helpLevel ?? 0) >= 2).length;
  const review = d.attempts.filter((a) => a.status === "review").length;
  const tokens = d.aiCalls.reduce((t, a) => t + Number(a.inputTokens) + Number(a.outputTokens), 0);
  const label = (f?: Family) => f?.email || "(unknown)";

  return (
    <div className="app-bg min-h-screen">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo href="/admin" />
          <Link href="/" className="btn btn-ghost">Back to homepage</Link>
        </div>
        <h1 className="text-3xl">Pilot admin</h1>

        <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Families signed up" value={d.families.length} />
          <Stat label="Children" value={d.children.length} />
          <Stat label="Active this week" value={activeWeek.size} note="families" />
          <Stat label="Worksheets started" value={worksheets.length} note={`${finished.length} finished`} />
          <Stat label="Hint 2 used" value={hint2} note="answers" />
          <Stat label="Waiting for review" value={review} note="answers" />
        </section>
        <p className="text-sm text-muted">AI use so far: {d.aiCalls.length} calls, {tokens.toLocaleString("en-IN")} tokens.</p>
        {d.activityMissing && (
          <p className="rounded-2xl bg-warn-soft p-4 text-warn">
            Page views aren&apos;t being recorded yet: run <code>supabase/migrations/0002_timer_activity.sql</code> in the Supabase SQL Editor.
          </p>
        )}

        <Card title="Families">
          <Table head={["Parent email", "Joined", "Last sign-in", "Children", "Worksheets (finished)", "Dashboard views", "Last activity"]}>
            {d.families.map((f) => {
              const kids = d.children.filter((c) => c.parentId === f.parentId);
              const ws = worksheets.filter((s) => s.parentId === f.parentId);
              const acts = d.activity.filter((a) => a.parentId === f.parentId);
              const last = [...ws.map((s) => s.startedAt), ...acts.map((a) => a.createdAt)].sort().at(-1);
              return (
                <tr key={f.parentId} className="border-t border-line">
                  <td className="py-2 font-bold">{f.email}</td>
                  <td>{date(f.joinedAt)}</td>
                  <td>{date(f.lastSignInAt)}</td>
                  <td>{kids.length ? kids.map((k) => k.nickname).join(", ") : <span className="text-warn">None yet</span>}</td>
                  <td>{ws.length ? `${ws.length} (${ws.filter((s) => s.status === "graded").length})` : <span className="text-warn">Not started</span>}</td>
                  <td>{acts.filter((a) => a.kind === "parent_dashboard").length}</td>
                  <td>{date(last)}</td>
                </tr>
              );
            })}
          </Table>
        </Card>

        <Card title="Worksheet sessions">
          <Table head={["Started", "Family", "Child", "Worksheet", "Status", "Score", "Time", "Hints (1 / 2)"]}>
            {worksheets.map((s) => {
              const ws = getWorksheet(s.worksheetId);
              const levels = Object.values(s.help ?? {});
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-2">{date(s.startedAt)}</td>
                  <td>{label(familyOf.get(s.parentId))}</td>
                  <td>{childOf.get(s.childId)?.nickname ?? "–"}</td>
                  <td>{ws?.title.en ?? s.worksheetId}{s.retryOf ? " (retry)" : ""}</td>
                  <td>{s.status === "graded" ? "Finished" : s.status === "writing" ? "Writing" : s.status === "checking" ? "Checking photos" : "Reading photos"}</td>
                  <td>{s.status === "graded" ? `${fmt(s.awarded ?? 0)}/${fmt(s.max ?? 0)}` : "–"}</td>
                  <td>{writingTime(s.startedAt, s.writingDoneAt, ws?.minutes ?? 60)?.text ?? "–"}</td>
                  <td>{levels.filter((l) => l === 1).length} / {levels.filter((l) => l >= 2).length}</td>
                </tr>
              );
            })}
          </Table>
        </Card>

        <Card title="What parents and children opened (latest 100)">
          <Table head={["When", "Family", "Child", "What"]}>
            {[...d.activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100).map((a, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-2">{date(a.createdAt)}</td>
                <td>{label(familyOf.get(a.parentId))}</td>
                <td>{(a.childId && childOf.get(a.childId)?.nickname) || "–"}</td>
                <td>{ACTIVITY[a.kind] ?? a.kind} {a.path && <span className="text-muted">· {a.path}</span>}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="card bg-white/95 p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card bg-white/95 p-5">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted">
          <tr>{head.map((h) => <th key={h} className="py-2 pr-4 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="[&_td]:pr-4">{children}</tbody>
      </table>
    </div>
  );
}
