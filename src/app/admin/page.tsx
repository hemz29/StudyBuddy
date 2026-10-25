import { notFound } from "next/navigation";
import { getLesson, getWorksheet } from "@/content";
import { SKILLS, type Skill } from "@/content/schema";
import { requireParent } from "@/lib/server/context";
import { isAdmin, loadAdminData, type Family } from "@/lib/server/admin";
import { writingTime } from "@/lib/time";
import { Logo } from "@/components/shell/Logo";
import { activityMix, busyTimes, childSummaries, devices, funnel, median, repeatParents, visits, weekly } from "@/lib/adminStats";
import { Bars, GrowthChart } from "@/components/admin/AdminCharts";
import { loadFeedback } from "@/lib/server/feedback";
import { INTENT, REPLACE, countBy, nps } from "@/lib/feedback";

// "💻 75% · 📱 20% · tablet 5% (40 visits)" from the device noted on each visit.
function deviceSplit(acts: { device: string | null }[]) {
  const known = acts.filter((a) => a.device);
  if (!known.length) return "–";
  const pct = (d: string) => Math.round((known.filter((a) => a.device === d).length / known.length) * 100);
  const parts = [["computer", "Computer"], ["phone", "Phone"], ["tablet", "Tablet"]].filter(([d]) => pct(d) > 0).map(([d, label]) => `${label} ${pct(d)}%`);
  return `${parts.join(" · ")} (${known.length} visit${known.length > 1 ? "s" : ""})`;
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "–");

// The owner's view of the pilot: who joined, who practised, how long sessions took, what parents looked at.
export default async function Admin() {
  const me = await requireParent();
  if (!isAdmin(me.email)) notFound();
  const [d, fb] = await Promise.all([loadAdminData(), loadFeedback()]);

  const familyOf = new Map(d.families.map((f) => [f.parentId, f]));
  const childOf = new Map(d.children.map((c) => [c.id, c]));
  const worksheets = d.sessions.filter((s) => s.kind === "worksheet").sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const finished = worksheets.filter((s) => s.status === "graded");
  const hint2 = d.attempts.filter((a) => (a.helpLevel ?? 0) >= 2).length;
  const review = d.attempts.filter((a) => a.status === "review").length;
  const tokens = d.aiCalls.reduce((t, a) => t + Number(a.inputTokens) + Number(a.outputTokens), 0);
  // Guests have no email: they're numbered by when they started, "Guest 1", "Guest 2"...
  const guestNo = new Map([...d.families].filter((f) => f.isGuest).sort((a, b) => (a.joinedAt ?? "").localeCompare(b.joinedAt ?? "")).map((f, i) => [f.parentId, i + 1]));
  const label = (f?: Family) => (f ? f.email || (guestNo.has(f.parentId) ? `Guest ${guestNo.get(f.parentId)}` : "(unknown)") : "(unknown)");
  const guests = d.families.filter((f) => f.isGuest).length;

  const vs = visits(d.activity, d.sessions);
  const repeat = repeatParents(d.activity, d.sessions);
  const active30 = new Set(vs.filter((v) => Date.now() - v.start < 30 * 864e5).map((v) => v.parentId)).size;
  const avgVisit = vs.length ? Math.round(vs.reduce((t, v) => t + v.minutes, 0) / vs.length) : null;
  const printed = d.activity.filter((a) => a.kind === "worksheet_print" || a.kind === "worksheet_download").length;
  const times = finished.map((s) => writingTime(s.startedAt, s.writingDoneAt, getWorksheet(s.worksheetId)?.minutes ?? 60)?.took).filter((t): t is number => !!t);
  const medTime = median(times);
  const avgScore = finished.length ? Math.round(finished.reduce((t, s) => t + (s.awarded ?? 0) / (s.max || 1), 0) / finished.length * 100) : null;
  const hinted = d.attempts.filter((a) => (a.helpLevel ?? 0) >= 1).length;
  const kids = childSummaries(d.children, d.sessions, d.attempts, d.activity, (k) => SKILLS[k as Skill]?.en ?? k).sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0));
  const lessonViews = Object.entries(d.activity.reduce<Record<string, number>>((m, a) => {
    const id = a.path?.match(/^\/learn\/lesson\/([^/?#]+)/)?.[1];
    if (id) m[id] = (m[id] ?? 0) + 1;
    return m;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ what: getLesson(id)?.title.en ?? id, n }));
  const score = nps(fb.rows.map((r) => r.answers.nps));
  const willUse = fb.rows.filter((r) => r.answers.intent === "Definitely" || r.answers.intent === "Probably").length;
  const weeks = weekly(d.families, d.children, d.sessions, vs);
  const busy = busyTimes(vs);
  const top = Object.entries(worksheets.reduce<Record<string, number>>((m, s) => ((m[s.worksheetId] = (m[s.worksheetId] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ what: getWorksheet(id)?.title.en ?? id, n }));

  return (
    <div className="app-bg min-h-screen">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        <Logo href="/" />
        <h1 className="text-3xl">Pilot admin</h1>

        <Card title="Feedback">
          {fb.missing ? (
            <p className="mt-2 rounded-2xl bg-warn-soft p-4 text-warn">Answers can&apos;t be saved yet: run <code>supabase/migrations/0003_feedback.sql</code> in the Supabase SQL Editor.</p>
          ) : !fb.rows.length ? (
            <p className="mt-2 text-muted">No answers yet. Share <b>/feedback?n=Name</b> with parents.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Replies" value={fb.rows.length} />
                <Stat label="Will use it for the next test" value={`${Math.round((willUse / fb.rows.length) * 100)}%`} note={`${willUse} said definitely or probably`} />
                <Stat label="NPS" value={score ?? "–"} note="% 9–10 minus % 0–6" />
                <Stat label="Average recommend" value={(fb.rows.reduce((t, r) => t + r.answers.nps, 0) / fb.rows.length).toFixed(1)} note="out of 10" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Bars title="Will you use it for your next Kannada test?" data={countBy(fb.rows, "intent", INTENT)} x="what" bars={[{ key: "n", name: "Parents" }]} horizontal />
                <Bars title="What should it take off your plate?" data={countBy(fb.rows, "replace", REPLACE)} x="what" bars={[{ key: "n", name: "Parents" }]} horizontal />
              </div>
              <Table head={["When", "Who", "Next test", "Take off my plate", "Recommend", "Comment"]}>
                {fb.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line align-top">
                    <td className="py-2">{date(r.createdAt)}</td>
                    <td>{r.name || (r.parentId ? label(familyOf.get(r.parentId)) : "Anonymous")}</td>
                    <td>{r.answers.intent}</td>
                    <td>{r.answers.replace}</td>
                    <td>{r.answers.nps}</td>
                    <td className="min-w-64">{r.answers.comment ?? "–"}</td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </Card>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <Stat label="Parents registered" value={d.families.length} note={`${d.families.length - guests} with email · ${guests} guests (no email yet)`} />
          <Stat label="Children registered" value={d.children.length} />
          <Stat label="Active parents" value={new Set(vs.filter((v) => Date.now() - v.start < 7 * 864e5).map((v) => v.parentId)).size} note={`this week · ${active30} in 30 days`} />
          <Stat label="Came back another day" value={repeat} note={d.families.length ? `${Math.round((repeat / d.families.length) * 100)}% of parents` : undefined} />
          <Stat label="Average visit" value={avgVisit === null ? "–" : `${avgVisit} min`} note={`${vs.length} visits · ${d.families.length ? fmt(vs.length / d.families.length) : 0} per parent`} />
          <Stat label="Worksheets printed" value={printed} note="downloads and prints" />
          <Stat label="Worksheets started" value={worksheets.length} note={`${finished.length} finished`} />
          <Stat label="Writing time" value={medTime === null ? "–" : `${Math.round(medTime)} min`} note="median per worksheet" />
          <Stat label="Average score" value={avgScore === null ? "–" : `${avgScore}%`} note="finished worksheets" />
          <Stat label="Answers with hints" value={d.attempts.length ? `${Math.round((hinted / d.attempts.length) * 100)}%` : "–"} note={`${hint2} used Hint 2`} />
          <Stat label="Waiting for review" value={review} note="answers" />
          <Stat label="AI calls" value={d.aiCalls.length} note={`${tokens.toLocaleString("en-IN")} tokens`} />
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <GrowthChart data={weeks} />
          <Bars title="Active parents per week" data={weeks} x="week" bars={[{ key: "active", name: "Parents" }]} />
          <Bars title="Worksheets per week" data={weeks} x="week" bars={[{ key: "started", name: "Started" }, { key: "finished", name: "Finished" }]} />
          <Bars title="From sign-up to coming back" note="Parents at each step" data={funnel(d.families, d.children, d.sessions, repeat)} x="step" bars={[{ key: "n", name: "Parents" }]} horizontal />
          <Bars title="What families use" data={activityMix(d.activity, d.sessions)} x="what" bars={[{ key: "n", name: "Times" }]} horizontal />
          <Bars title="Most read lessons" note="Times a lesson was opened" data={lessonViews} x="what" bars={[{ key: "n", name: "Opened" }]} horizontal />
          <Bars title="Most started worksheets" data={top} x="what" bars={[{ key: "n", name: "Started" }]} horizontal />
          <Bars title="Devices" note="Every recorded visit or action" data={devices(d.activity)} x="device" bars={[{ key: "n", name: "Events" }]} />
          <Bars title="Busiest days" note="Visits, India time" data={busy.days} x="day" bars={[{ key: "visits", name: "Visits" }]} />
          <Bars title="Busiest hours" note="Visits by hour of the day, India time" data={busy.hours} x="hour" bars={[{ key: "visits", name: "Visits" }]} />
        </section>
        <p className="text-xs text-muted">Visits group everything a family does with less than 30 minutes between steps. Page views and printing are counted from 24 Oct 2026, so earlier visits look shorter.</p>
        <p className="text-sm text-muted">Devices across all families: {deviceSplit(d.activity)}</p>
        {d.activityMissing && (
          <p className="rounded-2xl bg-warn-soft p-4 text-warn">
            Page views aren&apos;t being recorded yet: run <code>supabase/migrations/0002_timer_activity.sql</code> in the Supabase SQL Editor.
          </p>
        )}

        <Card title="What each child is doing">
          <p className="mt-1 text-sm text-muted">One row per child, most recently active first. Signals point out who needs a nudge and where children get stuck.</p>
          <Table head={["Child", "Family", "Days active", "Time spent", "Last seen", "Lessons read", "Grammar cards", "Worksheets", "Hints", "Signals"]}>
            {kids.map((k) => (
              <tr key={k.childId} className="border-t border-line align-top">
                <td className="py-2 font-bold">{k.nickname}</td>
                <td>{label(familyOf.get(k.parentId))}</td>
                <td>{k.days} <span className="text-muted">({k.visits} visits)</span></td>
                <td>{k.minutes ? `${k.minutes} min` : "–"}</td>
                <td>{k.lastSeen ? date(new Date(k.lastSeen).toISOString()) : "Never"}</td>
                <td>{k.lessons.length ? k.lessons.map((l) => getLesson(l)?.title.en ?? l).join(", ") : "–"}</td>
                <td>{k.cardSets ? `${k.cardSets} sets · ${k.cardPct}%` : "–"}</td>
                <td>{k.started ? `${k.finished} of ${k.started} finished${k.worksheetPct !== null ? ` · ${k.worksheetPct}%` : ""}` : "–"}</td>
                <td>{k.hintPct === null ? "–" : `${k.hintPct}% of answers`}</td>
                <td className="min-w-56">
                  {k.signals.length ? (
                    <ul className="flex flex-col gap-1">{k.signals.map((x) => <li key={x} className="rounded-lg bg-accent-soft px-2 py-1 text-xs">{x}</li>)}</ul>
                  ) : <span className="text-muted">On track</span>}
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Families">
          <Table head={["Parent email", "Joined", "Last sign-in", "Children", "Worksheets (finished)", "Dashboard views", "Device use", "Last activity"]}>
            {d.families.map((f) => {
              const kids = d.children.filter((c) => c.parentId === f.parentId);
              const ws = worksheets.filter((s) => s.parentId === f.parentId);
              const acts = d.activity.filter((a) => a.parentId === f.parentId);
              const last = [...ws.map((s) => s.startedAt), ...acts.map((a) => a.createdAt)].sort().at(-1);
              return (
                <tr key={f.parentId} className="border-t border-line">
                  <td className="py-2 font-bold">{label(f)}{f.isGuest && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium">guest</span>}</td>
                  <td>{date(f.joinedAt)}</td>
                  <td>{date(f.lastSignInAt)}</td>
                  <td>{kids.length ? kids.map((k) => k.nickname).join(", ") : <span className="text-warn">None yet</span>}</td>
                  <td>{ws.length ? `${ws.length} (${ws.filter((s) => s.status === "graded").length})` : <span className="text-warn">Not started</span>}</td>
                  <td>{acts.filter((a) => a.kind === "parent_dashboard").length}</td>
                  <td>{deviceSplit(acts)}</td>
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

      </main>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="card p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-light">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card bg-white p-5">
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
