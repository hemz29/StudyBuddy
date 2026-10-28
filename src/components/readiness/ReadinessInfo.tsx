"use client";
import { useRef } from "react";

// "How is this worked out?": the readiness rules in plain words (they mirror lib/readiness.ts), plus the handwriting note.
// A centred pop-up on a computer, a sheet from the bottom on a phone.
export function ReadinessInfo({ className = "" }: { className?: string }) {
  const box = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // inside a link (the home tile), open the pop-up instead of following the link
          e.stopPropagation();
          box.current?.showModal();
        }}
        className={`inline-flex items-center gap-1 text-sm font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-ink ${className}`}
      >
        <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full border border-current text-[10px] font-bold no-underline">i</span>
        How is this worked out?
      </button>
      <dialog
        ref={box}
        onClick={(e) => e.target === box.current && box.current?.close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-white p-0 text-ink backdrop:bg-black/40 sm:m-auto sm:max-w-xl sm:rounded-3xl"
      >
        <div className="max-h-[80vh] overflow-y-auto p-6 text-sm leading-relaxed">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold">How exam readiness is worked out</h2>
            <button type="button" onClick={() => box.current?.close()} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-lg">×</button>
          </div>
          <p className="mt-3">It&apos;s an estimate of the exam mark, worked out from answers saved in Kali Kannada. No AI is used for it.</p>
          <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5">
            <li><b>The exam paper.</b> It follows the school&apos;s term paper: 40 marks, 1 hour. Each kind of question (meanings, opposites, one-sentence answers, the poem…) counts as many marks as it does on that paper. Only the chapters chosen in Parent view count.</li>
            <li><b>How answers count.</b> Answers written on a worksheet count fully. Answers written with Hint 1 count for less, and with Hint 2 for much less. Quick tap cards count a little: picking an answer is easier than writing it, so cards alone can never show a skill as more than 75% known.</li>
            <li><b>Recent practice counts most.</b> An answer from 3 weeks ago counts half as much as one from today, so the meter shows how ready the learner is now.</li>
            <li><b>A cautious start.</b> Each skill starts as &quot;unknown&quot;, so one lucky answer can&apos;t show 100%. The exam can ask any word from a chapter, so a skill shown on only a few words counts for slightly less.</li>
            <li><b>Full practice tests.</b> A full practice test from the last 3 weeks is the best single sign, so it makes up half of the estimate.</li>
            <li><b>A range, not one number.</b> &quot;Likely 28–33 out of 40&quot; covers about 9 in 10 outcomes. It narrows as more practice is saved.</li>
            <li>
              <b>The levels.</b> Just starting (under 50%) · Getting there (50–69%) · Nearly ready (70–84%) · Exam ready (85% or more). Exam ready also needs a full practice test in the last 2 weeks: finished in time, with no hints, scoring 80% or more.
            </li>
            <li><b>Not enough practice yet</b> shows until written answers cover at least 60% of the paper&apos;s marks. Usually one full practice test is enough.</li>
          </ol>
          <HandwritingNote className="mt-5" />
        </div>
      </dialog>
    </>
  );
}

export function HandwritingNote({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-2xl bg-warn-soft p-4 text-sm text-warn ${className}`}>
      <b>Handwriting matters.</b> In the exam, marks depend on whether the teacher can read and understand the child&apos;s writing, and how they choose to mark it. Kali Kannada reads handwriting from photos, which isn&apos;t the same as a teacher reading it. The meter can&apos;t predict the exam exactly.
    </p>
  );
}
