import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getQuestion, getWorksheet, worksheetQuestionNumber } from "@/content";
import { requireParent, userStore } from "@/lib/server/context";
import { sessionTotals } from "@/lib/server/pipeline";
import { transliterate } from "@/lib/transliterate";
import { HandwritingStrip } from "@/components/session/HandwritingStrip";

// A reviewer (in the pilot: the owner sitting with the family) sets the mark for an answer.
async function setMark(formData: FormData) {
  "use server";
  const parent = await requireParent();
  const store = await userStore();
  const sessionId = String(formData.get("sessionId"));
  const attemptId = String(formData.get("attemptId"));
  const session = await store.getSession(parent.id, sessionId);
  const attempt = (await store.listSessionAttempts(parent.id, sessionId)).find((a) => a.id === attemptId);
  if (!session || !attempt) redirect("/parent");
  const awarded = Math.min(attempt.max, Math.max(0, Number(formData.get("awarded"))));
  await store.updateAttempt(parent.id, attemptId, {
    awarded,
    method: "reviewer",
    status: awarded === attempt.max ? "correct" : awarded === 0 ? "incorrect" : "partial",
  });
  await store.updateSession(parent.id, sessionId, sessionTotals(await store.listSessionAttempts(parent.id, sessionId)));
  redirect(`/parent/session/${sessionId}#${attemptId}`);
}

const STATUS: Record<string, string> = { correct: "✓ Correct", partial: "½ Partly right", incorrect: "✗ Not right", blank: "– Not answered", review: "Waiting for a reviewer" };
const METHOD: Record<string, string> = { key: "Marked from the teacher's answer key.", ai: "Marked by AI against the teacher's model answer.", reviewer: "Marked by a reviewer." };
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default async function SessionReview({ params }: { params: Promise<{ id: string }> }) {
  const parent = await requireParent();
  const store = await userStore();
  const session = await store.getSession(parent.id, (await params).id);
  const ws = session && getWorksheet(session.worksheetId);
  if (!session || !ws) notFound();
  const attempts = (await store.listSessionAttempts(parent.id, session.id)).sort((a, b) =>
    worksheetQuestionNumber(ws, a.questionId).localeCompare(worksheetQuestionNumber(ws, b.questionId), undefined, { numeric: true }),
  );

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8">
      <Link href="/parent" className="text-sm font-bold text-accent">← Dashboard</Link>
      <div className="card p-5">
        <h1 className="text-2xl font-extrabold">{ws.title.en}</h1>
        <p className="text-muted">
          {new Date(session.startedAt).toLocaleDateString("en-IN")} · {session.retryOf ? "Retry" : "First try"} · Score {fmt(session.awarded ?? 0)}/{fmt(session.max ?? 0)}
        </p>
        <p className="mt-2 text-sm text-muted">Each answer shows the child&apos;s handwriting, what was read, the teacher&apos;s model answer in English, and how it was marked. You can change any mark.</p>
      </div>

      {attempts.map((a) => {
        const q = getQuestion(a.questionId)!;
        const fb = a.feedback;
        return (
          <article key={a.id} id={a.id} className={`paper p-5 ${a.status === "review" ? "ring-2 ring-warn" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm text-gray-500">
                {worksheetQuestionNumber(ws, a.questionId)} · <span className="kn text-base text-gray-800">{q.prompt}</span>
                {q.promptEn && <span> · {q.promptEn}</span>}
              </p>
              <span className="chip bg-gray-100">{STATUS[a.status ?? "review"]} · {a.awarded != null ? `${fmt(a.awarded)}/${fmt(a.max)}` : `–/${fmt(a.max)}`}</span>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Child&apos;s answer</p>
                <HandwritingStrip sessionId={session.id} pageId={a.pageId} region={a.region} />
                <p className="kn mt-1 text-xl">{a.text || "(no answer)"}</p>
                {a.text && <p className="text-sm italic text-gray-500">{transliterate(a.text)}</p>}
                {a.helpLevel > 0 && <p className="mt-1 text-sm text-warn">Used “I’m stuck” help (step {a.helpLevel} of 4)</p>}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Teacher&apos;s answer</p>
                <p className="kn text-lg">{q.model?.kn ?? q.answers.join(" / ")}</p>
                {q.model?.en && <p className="text-gray-600">{q.model.en}</p>}
                {fb?.points && (
                  <ul className="mt-2 text-sm">
                    {fb.points.map((p) => <li key={p.point} className={p.met ? "text-good" : "text-bad"}>{p.met ? "✓" : "✗"} {p.point}</li>)}
                  </ul>
                )}
                {fb?.nearMiss && <p className="kn mt-2 text-sm">Spelling: wrote {fb.nearMiss.wrote} → {fb.nearMiss.correct}</p>}
                {a.method && <p className="mt-2 text-xs text-gray-500">{METHOD[a.method]}</p>}
              </div>
            </div>
            <form action={setMark} className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 text-sm">
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="attemptId" value={a.id} />
              <span className="font-bold text-gray-600">{a.status === "review" ? "Mark this answer:" : "Change mark:"}</span>
              {[0, a.max / 2, a.max].map((m) => (
                <button key={m} name="awarded" value={m} className={`chip h-8 px-3 ${a.awarded === m ? "bg-accent text-accent-ink" : "bg-accent-soft"}`}>{fmt(m)}</button>
              ))}
            </form>
          </article>
        );
      })}
    </main>
  );
}
