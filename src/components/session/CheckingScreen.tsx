"use client";
import { useEffect, useRef, useState } from "react";
import { getQuestion, getWorksheet, worksheetQuestionNumber } from "@/content";
import { transliterate } from "@/lib/transliterate";
import type { QuestionAttempt } from "@/lib/store/types";
import { HandwritingStrip } from "./HandwritingStrip";
import { UploadPanel } from "./UploadPanel";
import type { SessionState } from "./SessionView";
import { KnText } from "@/components/Word";

// confirmed: the child has decided. flagged: none of the readings is what they wrote, so a grown-up checks it.
type Choice = { confirmed: boolean; replace: { word: string; with: string }[]; flagged?: boolean };

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
      body: JSON.stringify({ confirmations: unsure.map((a) => ({ attemptId: a.id, replace: choices[a.id]?.replace ?? [], flagged: choices[a.id]?.flagged ?? false })) }),
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
          Your parent can see your photo next to these answers.
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
  const [saysNo, setSaysNo] = useState(false);
  const [picked, setPicked] = useState<{ word: string; with: string }[]>(choice?.replace ?? []);
  const shown = (w: string) => picked.find((r) => r.word === w)?.with ?? w;
  const unsureWords = new Map(attempt.uncertainWords.map((u) => [u.word, u.alternatives]));
  const decided = choice?.confirmed && !saysNo;

  function pick(word: string, alt: string) {
    const rest = picked.filter((r) => r.word !== word);
    setPicked(alt === word ? rest : [...rest, { word, with: alt }]);
  }
  const reading = (
    <div className="mt-1 flex flex-wrap gap-2">
      {attempt.text.split(/\s+/).map((w, i) => (
        <span key={i} className={`flex flex-col items-center rounded-lg px-2 py-1 ${unsureWords.has(w) ? "bg-yellow-100 ring-2 ring-yellow-300" : ""}`}>
          <KnText text={shown(w)} className="text-2xl" />
          <span className="text-xs italic text-gray-500">{transliterate(shown(w))}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`paper p-5 ${decided ? (choice?.flagged ? "ring-2 ring-warn" : "ring-2 ring-good") : ""}`}>
      <p className="text-sm font-bold text-gray-500">Question {number}: <KnText text={q.prompt} className="font-normal" /></p>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-500">Your writing</p>
      <HandwritingStrip sessionId={sessionId} pageId={attempt.pageId} region={attempt.region} />
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">What we read</p>
      {reading}

      {decided ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <span className="font-bold">
            {choice.flagged ? "🧑‍🏫 A grown-up will check this one" : picked.length ? "✓ Changed to what you wrote" : "✓ That's what you wrote"}
          </span>
          <button onClick={() => { setSaysNo(false); onChange({ confirmed: false, replace: picked }); }} className="text-sm font-bold text-accent">Change</button>
        </div>
      ) : !saysNo ? (
        <>
          <p className="mt-4 font-bold">Look at your writing. Is this exactly what you wrote?</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button onClick={() => { setPicked([]); onChange({ confirmed: true, replace: [] }); }} className="btn btn-primary">✓ Yes, that&apos;s what I wrote</button>
            <button onClick={() => setSaysNo(true)} className="btn border-2 border-bad/40 bg-white text-bad">✗ No, I wrote something else</button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-yellow-50 p-4">
          {attempt.uncertainWords.map((u) => (
            <div key={u.word}>
              <p className="text-sm font-bold">Which one did you write?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[u.word, ...u.alternatives].map((alt) => (
                  <button
                    key={alt}
                    onClick={() => pick(u.word, alt)}
                    className={`kn rounded-xl border-2 bg-white px-4 py-2 text-2xl ${shown(u.word) === alt ? "border-accent bg-accent-soft" : "border-gray-200"}`}
                  >
                    <KnText text={alt} mode="hover" />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => { setSaysNo(false); onChange({ confirmed: true, replace: picked }); }} className="btn btn-primary">✓ Now it&apos;s what I wrote</button>
            <button onClick={() => { setSaysNo(false); setPicked([]); onChange({ confirmed: true, replace: [], flagged: true }); }} className="btn btn-ghost">None of these – a grown-up will check it</button>
          </div>
          <button onClick={onRetake} className="self-start text-sm font-bold text-muted">Photo too blurry? Send this page again</button>
        </div>
      )}
    </div>
  );
}
