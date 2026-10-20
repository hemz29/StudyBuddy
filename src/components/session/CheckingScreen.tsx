"use client";
import { useEffect, useRef, useState } from "react";
import { getQuestion, getWorksheet, worksheetQuestionNumber } from "@/content";
import { transliterate } from "@/lib/transliterate";
import type { QuestionAttempt } from "@/lib/store/types";
import { HandwritingStrip } from "./HandwritingStrip";
import { UploadPanel } from "./UploadPanel";
import type { SessionState } from "./SessionView";

type Choice = { confirmed: boolean; replace: { word: string; with: string }[] };

// The child checks only the answers whose reading was unsure. They confirm what they wrote, mistakes included.
export function CheckingScreen({ state, worksheetId, onDone }: { state: SessionState; worksheetId: string; onDone: () => void }) {
  const ws = getWorksheet(worksheetId)!;
  const total = ws.sections.reduce((t, s) => t + s.questions.length, 0);
  const unsure = state.attempts.filter((a) => !a.readingConfirmed).sort((a, b) => worksheetQuestionNumber(ws, a.questionId).localeCompare(worksheetQuestionNumber(ws, b.questionId), undefined, { numeric: true }));
  const read = state.attempts.filter((a) => a.text.trim()).length;
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [moreUpload, setMoreUpload] = useState(false);
  const auto = useRef(false);

  async function mark() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/sessions/${state.session.id}/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmations: unsure.map((a) => ({ attemptId: a.id, replace: choices[a.id]?.replace ?? [] })) }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Something went wrong. Please try again.");
      setBusy(false);
      return;
    }
    onDone();
  }

  // Everything was read clearly and every question has an answer: go straight to marking.
  useEffect(() => {
    if (!auto.current && unsure.length === 0 && state.attempts.length >= total) {
      auto.current = true;
      mark();
    }
  });

  const allChecked = unsure.every((a) => choices[a.id]?.confirmed);

  if (busy) return <div className="card mx-auto max-w-xl p-10 text-center"><p className="text-4xl">✏️</p><p className="mt-3 text-xl font-bold">Marking your work…</p><p className="text-muted">This takes up to a minute.</p></div>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold">Let&apos;s check we read your writing correctly</h1>
        <p className="mt-1 text-muted">
          We read {read} of {total} answers.{" "}
          {unsure.length ? `${unsure.length} need a quick check.` : "They were all clear."}
        </p>
        <p className="mt-3 rounded-xl bg-accent-soft px-4 py-3 text-sm">
          Only check that the words below are <b>what you wrote</b> – even if you think your answer is wrong. Mistakes will be marked fairly.
        </p>
      </div>

      {unsure.map((a) => (
        <CheckCard key={a.id} attempt={a} number={worksheetQuestionNumber(ws, a.questionId)} sessionId={state.session.id} choice={choices[a.id]} onChange={(c) => setChoices((x) => ({ ...x, [a.id]: c }))} onRetake={() => setMoreUpload(true)} />
      ))}

      {read < total && !moreUpload && (
        <button onClick={() => setMoreUpload(true)} className="btn btn-ghost">Some answers missing? Send another page</button>
      )}
      {moreUpload && <UploadPanel state={state} onOpen={() => {}} refresh={onDone} />}

      {error && <p className="text-bad">{error}</p>}
      <button onClick={mark} disabled={!allChecked} className="btn btn-primary h-14 text-lg">
        {allChecked ? "Mark my work" : `Check ${unsure.filter((a) => !choices[a.id]?.confirmed).length} more answer(s) first`}
      </button>
      {read < total && <p className="text-center text-sm text-muted">Questions without an answer will count as not answered.</p>}
    </div>
  );
}

function CheckCard({ attempt, number, sessionId, choice, onChange, onRetake }: { attempt: QuestionAttempt; number: string; sessionId: string; choice?: Choice; onChange: (c: Choice) => void; onRetake: () => void }) {
  const q = getQuestion(attempt.questionId)!;
  const [openWord, setOpenWord] = useState<string | null>(null);
  const replace = choice?.replace ?? [];
  const shown = (w: string) => replace.find((r) => r.word === w)?.with ?? w;
  const unsureWords = new Map(attempt.uncertainWords.map((u) => [u.word, u.alternatives]));

  function pick(word: string, alt: string | null) {
    const rest = replace.filter((r) => r.word !== word);
    onChange({ confirmed: false, replace: alt ? [...rest, { word, with: alt }] : rest });
    setOpenWord(null);
  }

  return (
    <div className={`paper p-5 ${choice?.confirmed ? "ring-2 ring-good" : ""}`}>
      <p className="text-sm font-bold text-gray-500">Question {number}: <span className="kn font-normal">{q.prompt}</span></p>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-500">Your writing</p>
      <HandwritingStrip sessionId={sessionId} pageId={attempt.pageId} region={attempt.region} />
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">What we read</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {attempt.text.split(/\s+/).map((w, i) =>
          unsureWords.has(w) ? (
            <button key={i} onClick={() => setOpenWord(openWord === w ? null : w)} className="flex flex-col items-center rounded-lg bg-yellow-100 px-2 py-1 ring-2 ring-yellow-300">
              <span className="kn text-2xl">{shown(w)}</span>
              <span className="text-xs italic text-gray-500">{transliterate(shown(w))}</span>
            </button>
          ) : (
            <span key={i} className="flex flex-col items-center px-1 py-1">
              <span className="kn text-2xl">{w}</span>
              <span className="text-xs italic text-gray-500">{transliterate(w)}</span>
            </span>
          ),
        )}
      </div>
      {openWord && (
        <div className="mt-3 rounded-xl bg-yellow-50 p-3">
          <p className="text-sm font-bold">Did you write one of these instead?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => pick(openWord, null)} className="kn rounded-lg border-2 border-gray-300 bg-white px-3 py-1 text-xl">{openWord}</button>
            {unsureWords.get(openWord)!.map((alt) => (
              <button key={alt} onClick={() => pick(openWord, alt)} className="kn rounded-lg border-2 border-gray-300 bg-white px-3 py-1 text-xl">{alt}</button>
            ))}
            <button onClick={onRetake} className="rounded-lg px-3 py-1 text-sm font-bold text-bad">None of these → retake photo</button>
          </div>
        </div>
      )}
      <button onClick={() => onChange({ confirmed: true, replace })} className={`btn mt-4 w-full ${choice?.confirmed ? "btn-soft" : "btn-primary"}`}>
        {choice?.confirmed ? "✓ Checked" : "✓ Yes, this is what I wrote"}
      </button>
    </div>
  );
}
