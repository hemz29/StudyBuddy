"use client";
import Link from "next/link";
import { getQuestion, getWorksheet, MARKING } from "@/content";
import type { QuestionAttempt } from "@/lib/store/types";
import { HandwritingStrip } from "./HandwritingStrip";
import type { SessionState } from "./SessionView";

const ICON: Record<string, string> = { correct: "✓", partial: "½", incorrect: "✗", blank: "–", review: "…" };
const TONE: Record<string, string> = { correct: "bg-good-soft text-good", partial: "bg-warn-soft text-warn", incorrect: "bg-bad-soft text-bad", blank: "bg-gray-100 text-gray-500", review: "bg-accent-soft" };
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function Results({ state, worksheetId }: { state: SessionState; worksheetId: string }) {
  const ws = getWorksheet(worksheetId)!;
  const { session, attempts } = state;
  const byQ = new Map(attempts.map((a) => [a.questionId, a]));
  const awarded = session.awarded ?? 0;
  const max = session.max ?? 0;
  const pct = max ? Math.round((awarded / max) * 100) : 0;
  const answered = attempts.filter((a) => a.text.trim());
  const onOwn = answered.filter((a) => (a.helpLevel ?? 0) === 0).length;
  const review = attempts.filter((a) => a.status === "review").length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="card p-6 text-center">
        <p className="text-5xl">{pct >= 80 ? "🌟" : pct >= 50 ? "👏" : "💪"}</p>
        <h1 className="mt-2 text-4xl font-extrabold">{fmt(awarded)} / {fmt(max)}</h1>
        <p className="text-lg text-muted">{pct}% · {ws.title.en}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="chip bg-accent-soft">Answered on your own: {onOwn} of {answered.length}</span>
          {review > 0 && <span className="chip bg-warn-soft text-warn">{review} answer(s) waiting for a grown-up to check</span>}
        </div>
        <p className="mt-3 text-xs text-muted">{MARKING.label}</p>
      </div>

      {ws.sections.map((s, si) => {
        const got = s.questions.reduce((t, q) => t + (byQ.get(q.id)?.awarded ?? 0), 0);
        return (
          <section key={s.type} className="paper p-5">
            <div className="flex items-start justify-between">
              <h2 className="font-bold">{si + 1}. {s.en}</h2>
              <span className="chip bg-gray-100">{fmt(got)} / {fmt(s.marksEach * s.questions.length)}</span>
            </div>
            <ul className="mt-2 divide-y divide-gray-100">
              {s.questions.map((q, qi) => (
                <Row key={q.id} n={`${si + 1}.${qi + 1}`} a={byQ.get(q.id)} qid={q.id} sessionId={session.id} />
              ))}
            </ul>
          </section>
        );
      })}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/learn/worksheet/${ws.id}?retry=${session.retryOf ?? session.id}`} className="btn btn-primary">Try this worksheet again</Link>
        <Link href="/learn" className="btn btn-ghost">Back home</Link>
      </div>
    </div>
  );
}

function Row({ n, a, qid, sessionId }: { n: string; a?: QuestionAttempt; qid: string; sessionId: string }) {
  const q = getQuestion(qid)!;
  const status = a?.status ?? "blank";
  const fb = a?.feedback;
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <span className={`chip mt-1 w-12 justify-center ${TONE[status]}`}>{ICON[status]} {a?.awarded != null ? fmt(a.awarded) : ""}</span>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{n} · <span className="kn">{q.prompt}</span></p>
          <p className="kn text-xl">{a?.text || <span className="text-base text-gray-400">(no answer)</span>}</p>
          {fb?.en && status !== "correct" && <p className="mt-1 text-gray-700">{fb.en}</p>}
          {fb?.points && (
            <ul className="mt-1 text-sm">
              {fb.points.map((p) => (
                <li key={p.point} className={p.met ? "text-good" : "text-bad"}>{p.met ? "✓" : "✗"} {p.point}</li>
              ))}
            </ul>
          )}
          {fb?.nearMiss && (
            <div className="mt-2 rounded-xl bg-yellow-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-yellow-800">Your writing vs. correct writing</p>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                <div>
                  <HandwritingStrip sessionId={sessionId} pageId={a?.pageId ?? null} region={a?.region ?? null} />
                  <p className="kn mt-1 text-lg">You wrote: {fb.nearMiss.wrote}</p>
                </div>
                <p className="kn self-center text-2xl font-bold text-good">✓ {fb.nearMiss.correct}</p>
              </div>
            </div>
          )}
          {fb?.model && status !== "correct" && (
            <details className="mt-1 text-sm">
              <summary className="cursor-pointer font-bold text-accent">See the model answer</summary>
              <p className="kn mt-1 text-lg">{fb.model.kn}</p>
              <p className="text-gray-500">{fb.model.en}</p>
            </details>
          )}
        </div>
        {(a?.helpLevel ?? 0) > 0 && <span className="chip bg-warn-soft text-warn">Help used</span>}
      </div>
    </li>
  );
}
