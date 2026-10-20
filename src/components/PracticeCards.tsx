"use client";
import { useState } from "react";
import Link from "next/link";
import type { QuestionType, Skill } from "@/content/schema";
import { transliterate } from "@/lib/transliterate";

export type Card = {
  questionId: string;
  skill: Skill;
  type: QuestionType;
  label: string;
  prompt: string;
  correct: string;
  options: string[];
};

export function PracticeCards({ lessonId, title, cards }: { lessonId: string; title: { kn: string; en: string }; cards: Card[] }) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [saved, setSaved] = useState(false);
  const card = cards[i];
  const done = i >= cards.length;

  async function finish(all: typeof results) {
    await fetch("/api/cards", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId, results: all }) });
    setSaved(true);
  }

  function choose(opt: string) {
    if (chosen) return;
    setChosen(opt);
    setResults((r) => [...r, { questionId: card.questionId, correct: opt === card.correct }]);
  }

  function next() {
    const nextI = i + 1;
    setChosen(null);
    setI(nextI);
    if (nextI >= cards.length) finish(results);
  }

  if (done) {
    const right = results.filter((r) => r.correct).length;
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl">{right >= cards.length * 0.8 ? "🌟" : "👍"}</p>
        <h1 className="mt-3 text-3xl font-extrabold">{right} of {cards.length} correct</h1>
        <p className="mt-2 text-muted">{saved ? "Saved to your progress." : "Saving…"}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn btn-soft" onClick={() => { setI(0); setResults([]); setSaved(false); }}>Play again</button>
          <Link href="/learn" className="btn btn-primary">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between text-sm font-bold" style={{ color: "var(--header-ink)" }}>
        <span className="kn">{title.kn}</span>
        <span>Card {i + 1} of {cards.length}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/40">
        <div className="h-full bg-accent transition-all" style={{ width: `${(i / cards.length) * 100}%` }} />
      </div>
      <div className="paper p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
        <p className="kn mt-3 text-5xl font-bold">{card.prompt}</p>
        <p className="mt-1 italic text-gray-500">{transliterate(card.prompt)}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {card.options.map((o) => {
            const state = !chosen ? "" : o === card.correct ? "border-good bg-good-soft" : o === chosen ? "border-bad bg-bad-soft" : "opacity-50";
            return (
              <button key={o} onClick={() => choose(o)} className={`kn rounded-2xl border-2 border-gray-200 p-4 text-2xl font-bold transition hover:border-accent ${state}`}>
                {o}
              </button>
            );
          })}
        </div>
        {chosen && (
          <div className="mt-6">
            <p className={`text-lg font-bold ${chosen === card.correct ? "text-good" : "text-bad"}`}>
              {chosen === card.correct ? "Correct!" : <>Not quite – it is <span className="kn">{card.correct}</span></>}
            </p>
            <button onClick={next} className="btn btn-primary mt-4 w-full">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
