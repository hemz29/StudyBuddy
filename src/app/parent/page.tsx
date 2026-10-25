import Link from "next/link";
import { markDependsOnCheck } from "@/lib/grading/grade";
import { redirect } from "next/navigation";
import { getWorksheet, MARKING } from "@/content";
import { isDemo, requireParent, userStore } from "@/lib/server/context";
import { recommendation, scoreTrend, skillRows } from "@/lib/dashboard";
import { ScoreChart } from "@/components/parent/ScoreChart";
import { DemoBanner } from "@/components/DemoBanner";
import { AvatarImage } from "@/components/AvatarImage";
import { Logo } from "@/components/shell/Logo";
import { logActivity } from "@/lib/server/activity";
import { isAdmin } from "@/lib/server/admin";
import { writingTime } from "@/lib/time";
import { ActivityPing } from "@/components/ActivityPing";
import { SignOutButton } from "@/components/SignOutButton";
import { LineIcon } from "@/components/LineIcon";
import { SaveProgressStrip } from "@/components/SaveProgressStrip";

async function deleteChild(formData: FormData) {
  "use server";
  const parent = await requireParent();
  await (await userStore()).deleteChild(parent.id, String(formData.get("childId")));
  redirect("/parent");
}

const STATUS = { not_started: "Not practised yet", in_progress: "Practised before", recent: "Practised this week" };
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default async function ParentDashboard({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const parent = await requireParent();
  const store = await userStore();
  const children = await store.listChildren(parent.id);
  if (!children.length) redirect("/profiles");
  const { child: childParam } = await searchParams;
  const child = children.find((c) => c.id === childParam) ?? children[0];

  const [sessions, attempts] = await Promise.all([store.listSessions(parent.id, child.id), store.listChildAttempts(parent.id, child.id)]);
  const worksheets = sessions.filter((s) => s.kind === "worksheet").sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const graded = worksheets.filter((s) => s.status === "graded");
  const latest = graded[0];
  const week = sessions.filter((s) => Date.now() - Date.parse(s.startedAt) < 7 * 864e5 && s.status === "graded").length;
  const answered = attempts.filter((a) => a.text.trim() || a.method === "key");
  const fullMarks = attempts.filter((a) => a.awarded !== null && a.awarded === a.max).length;
  const written = attempts.filter((a) => a.pageId && a.text.trim());
  const own = written.filter((a) => a.helpLevel === 0).length;
  const review = attempts.filter((a) => a.status === "review");
  const childChecked = attempts.filter((a) => a.sessionId === latest?.id && markDependsOnCheck(a));
  const skills = skillRows(attempts);
  const trend = scoreTrend(sessions, attempts);
  const rec = recommendation(attempts);
  await logActivity(store, parent.id, { kind: "parent_dashboard", path: "/parent", childId: child.id });

  return (
    <div className="app-bg min-h-screen">
      <ActivityPing />
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      {isDemo && <DemoBanner />}
      {parent.isGuest && <SaveProgressStrip name={child.nickname} />}
      <div className="flex flex-wrap items-center gap-3">
        <span className="mr-auto"><Logo href="/" /></span>
        <Link href="/feedback" className="btn btn-ghost"><LineIcon name="chat" size={20} /> Give feedback</Link>
        <SignOutButton isGuest={parent.isGuest} className="btn btn-ghost" />
        {children.length > 1 &&
          children.map((c) => (
            <Link key={c.id} href={`/parent?child=${c.id}`} className={`chip h-9 px-4 ${c.id === child.id ? "bg-accent text-accent-ink" : "bg-white/80"}`}>{c.nickname}</Link>
          ))}
        {isAdmin(parent.email) && <Link href="/admin" className="btn btn-ghost">Admin</Link>}
      </div>
      <header className="flex flex-wrap items-center gap-5 rounded-[var(--radius)] bg-black p-6 text-white sm:p-8">
        <AvatarImage avatar={child.theme} size={72} className="shrink-0 rounded-full bg-white" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--brand-yellow)]">Parent view</p>
          <h1 className="text-3xl font-extralight sm:text-4xl">{child.nickname}&apos;s progress <span className="text-[var(--brand-yellow)]">you can follow.</span></h1>
          <p className="text-sm text-gray-300">{MARKING.label}</p>
        </div>
      </header>

      {review.length > 0 && (
        <Link href={`/parent/session/${review[0].sessionId}`} className="rounded-2xl bg-warn-soft p-4 font-bold text-warn">
          {review.length} answer(s) are waiting to be marked by a reviewer → open
        </Link>
      )}

      {childChecked.length > 0 && (
        <Link href={`/parent/session/${latest!.id}#${childChecked[0].id}`} className="rounded-2xl bg-sky p-4 font-bold text-sky-ink">
          {childChecked.length} mark(s) in the latest worksheet depended on {child.nickname}&apos;s own check of the handwriting → compare with the photos
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Latest worksheet" value={latest ? `${fmt(latest.awarded ?? 0)}/${fmt(latest.max ?? 0)}` : "–"} note={latest ? `${Math.round(((latest.awarded ?? 0) / (latest.max || 1)) * 100)}% · ${new Date(latest.completedAt!).toLocaleDateString("en-IN")}` : "No worksheet marked yet"} />
        <Stat label="Practice this week" value={String(week)} note="worksheets and card sets finished" />
        <Stat label="Questions answered" value={String(answered.length)} note={`${fullMarks} got full marks`} />
        <Stat label="Written without hints" value={written.length ? `${Math.round((own / written.length) * 100)}%` : "–"} note={written.length ? `${own} of ${written.length} written answers` : "Shows after the first worksheet"} />
      </section>

      <section className="card bg-white p-5">
        <h2 className="text-lg font-bold">Recommended next practice</h2>
        {rec ? <p className="mt-1">{rec.text}</p> : <p className="mt-1 text-muted">Not enough answers yet to make a fair suggestion. After a few worksheets, this will point to the area that needs most practice.</p>}
      </section>

      <section className="card bg-white p-5">
        <h2 className="text-lg font-bold">Skills</h2>
        <p className="text-sm text-muted">Each percentage only counts questions that test that skill. “Not practised yet” is not a low score.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted">
              <tr><th className="py-2">Skill</th><th>Status</th><th>Questions</th><th>Marks</th><th className="w-1/3">Score</th></tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.skill} className="border-t border-line">
                  <td className="py-3 font-bold">{s.label}</td>
                  <td className="text-sm">{STATUS[s.status]}</td>
                  <td>{s.attempted || "–"}</td>
                  <td>{s.available ? `${fmt(s.earned)} of ${fmt(s.available)}` : "–"}</td>
                  <td>
                    {s.pct === null ? <span className="text-sm text-muted">Not practised yet</span> : (
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-accent-soft"><div className="h-full rounded-full bg-accent" style={{ width: `${s.pct}%` }} /></div>
                        <span className="w-10 text-right font-bold">{s.pct}%</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-white p-5">
        <h2 className="text-lg font-bold">Score over time</h2>
        <p className="text-sm text-muted">First try of each worksheet, as a percentage (worksheets have different totals). Indicative only: worksheets cover different chapters, and scores here don&apos;t predict school exam marks.</p>
        {trend.length >= 2 ? <ScoreChart points={trend} /> : <p className="mt-4 rounded-xl bg-accent-soft p-4 text-sm">Not enough worksheets yet to show a trend – {trend.length === 1 ? "one more" : "two"} to go.</p>}
      </section>

      <section className="card bg-white p-5">
        <h2 className="text-lg font-bold">History</h2>
        {worksheets.length === 0 ? <p className="mt-2 text-muted">No worksheets yet.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted"><tr><th className="py-2">Date</th><th>Worksheet</th><th>Try</th><th>Score</th><th>Time</th><th>Hints</th><th /></tr></thead>
              <tbody>
                {worksheets.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-3">{new Date(s.startedAt).toLocaleDateString("en-IN")}</td>
                    <td>{getWorksheet(s.worksheetId)?.title.en}</td>
                    <td>{s.retryOf ? "Retry" : "First try"}</td>
                    <td>{s.status === "graded" ? `${fmt(s.awarded ?? 0)}/${fmt(s.max ?? 0)}` : <span className="text-muted">Not finished</span>}</td>
                    <td>{writingTime(s.startedAt, s.writingDoneAt, getWorksheet(s.worksheetId)?.minutes ?? 60)?.text ?? "–"}</td>
                    <td>{hintText(s.help)}</td>
                    <td>{s.status === "graded" && <Link href={`/parent/session/${s.id}`} className="font-bold text-accent">Review answers →</Link>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link href="/feedback" className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
        <span className="flex-1"><b className="font-semibold">How is Kali Kannada working for you?</b> <span className="text-muted">Give feedback in 30 seconds.</span></span>
        <span aria-hidden>→</span>
      </Link>

      <section className="card bg-white p-5 text-sm text-muted">
        <h2 className="text-base font-bold text-ink">Your data</h2>
        <p className="mt-1">We store {child.nickname}&apos;s nickname, answers, marks and the answer photos (so you can check the marking). Photos are only visible to you. AI is used to read handwriting and mark sentence answers; we log how much it costs, not what was written.</p>
        <form action={deleteChild} className="mt-3">
          <input type="hidden" name="childId" value={child.id} />
          <button className="font-bold text-bad underline">Delete {child.nickname}&apos;s profile and all their data</button>
        </form>
      </section>
    </main>
      <Link href="/feedback" aria-label="Give feedback" title="Give feedback" className="fixed right-5 bottom-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-black text-[var(--brand-yellow)] shadow-lg transition hover:scale-105">
        <LineIcon name="chat" size={26} />
      </Link>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card bg-white p-5">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}

// "2 × Hint 1, 1 × Hint 2" for the history table.
function hintText(help: Record<string, number>) {
  const levels = Object.values(help);
  const h1 = levels.filter((l) => l === 1).length;
  const h2 = levels.filter((l) => l >= 2).length;
  return [h1 && `${h1} × Hint 1`, h2 && `${h2} × Hint 2`].filter(Boolean).join(", ") || "None";
}
