"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/content/schema";
import { transliterate } from "@/lib/transliterate";

type Sentence = { id: string; kn: string; en: string };
type Picked = { word: string; sentence: Sentence };

const stripPunct = (w: string) => w.replace(/[.,!?;:"'“”‘’()]/g, "");

export function LessonReader({ lesson }: { lesson: Lesson }) {
  const [showTr, setShowTr] = useState(true);
  const [showEn, setShowEn] = useState(true);
  const [picked, setPicked] = useState<Picked | null>(null);

  // Longest glossary words first, so "ಪ್ರವಾಸಿ ತಾಣ" wins over "ತಾಣ".
  const glossary = useMemo(() => [...lesson.glossary].sort((a, b) => b.word.length - a.word.length), [lesson]);
  // "ಗುಹೆಯನ್ನು" finds "ಗುಹೆ": glossary words match the start of the word in the text.
  const lookup = (w: string) => glossary.find((g) => w.startsWith(g.word.replace(/\s/g, "")));

  const blocks: { heading?: { kn: string; en: string }; sentences: Sentence[]; intro?: boolean }[] = [
    ...(lesson.intro.length ? [{ heading: { kn: "ಪಾಠ ಪ್ರವೇಶ", en: "Introduction" }, sentences: lesson.intro, intro: true }] : []),
    ...lesson.parts,
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <div className="mr-auto">
          <h1 className="kn text-3xl font-bold">{lesson.title.kn}</h1>
          <p className="text-muted">
            {lesson.title.en}
            {lesson.author.en && ` · ${lesson.author.en}`}
          </p>
          <p className="mt-1 chip bg-good-soft text-good">From your teacher&apos;s notes</p>
        </div>
        <Toggle on={showTr} set={setShowTr} label="Sound it out (English letters)" />
        <Toggle on={showEn} set={setShowEn} label="English meaning" />
        <Link href={`/learn/cards/${lesson.id}`} className="btn btn-soft">Practise →</Link>
      </div>

      <p className="text-sm opacity-80" style={{ color: "var(--header-ink)" }}>
        Tap any Kannada word to see how to say it{lesson.glossary.length ? " and its meaning if it is in the word list" : ""}.
      </p>

      {blocks.map((b, bi) => (
        <section key={bi} className="paper overflow-hidden">
          {b.heading && (
            <h2 className="border-b border-gray-100 bg-gray-50 px-5 py-3 font-bold">
              <span className="kn">{b.heading.kn}</span> <span className="text-gray-500">· {b.heading.en}</span>
            </h2>
          )}
          <ol className={lesson.kind === "poem" && !b.intro ? "py-2" : "divide-y divide-gray-100"}>
            {b.sentences.map((s) => (
              <li key={s.id} className={`grid gap-3 px-5 ${lesson.kind === "poem" && !b.intro ? "py-1.5" : "py-3"} ${showEn ? "md:grid-cols-2" : ""}`}>
                <div>
                  <p className="kn text-[1.45rem] leading-relaxed">
                    {s.kn.split(/(\s+)/).map((w, i) =>
                      /\s/.test(w) ? (
                        w
                      ) : (
                        <button
                          key={i}
                          onClick={() => setPicked({ word: stripPunct(w), sentence: s })}
                          className={`rounded px-0.5 hover:bg-yellow-100 ${lookup(stripPunct(w)) ? "underline decoration-dotted decoration-gray-400 underline-offset-8" : ""}`}
                        >
                          {w}
                        </button>
                      ),
                    )}
                  </p>
                  {showTr && <p className="mt-0.5 text-[0.95rem] italic text-gray-500">{transliterate(s.kn)}</p>}
                </div>
                {showEn && <p className="self-center text-gray-700">{s.en}</p>}
              </li>
            ))}
          </ol>
        </section>
      ))}

      {lesson.summaryEn.length > 0 && (
        <section className="card p-5">
          <h2 className="text-lg font-bold">What the poem is about</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {lesson.summaryEn.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      )}

      <section className="paper p-5">
        <h2 className="text-lg font-bold">ಪದಗಳ ಅರ್ಥ · Word meanings</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {lesson.glossary.map((g) => (
            <div key={g.word}>
              <dt className="kn text-xl font-bold">{g.word} <span className="text-sm font-normal italic text-gray-500">{transliterate(g.word)}</span></dt>
              <dd className="kn text-gray-700">{g.meaningKn} <span className="text-gray-500">· {g.meaningEn}</span></dd>
            </div>
          ))}
        </dl>
      </section>

      {picked && <WordPopup picked={picked} meaning={lookup(picked.word)} close={() => setPicked(null)} />}
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className={`chip h-10 px-4 ${on ? "bg-accent text-accent-ink" : "bg-accent-soft"}`} aria-pressed={on}>
      {on ? "✓ " : ""}{label}
    </button>
  );
}

function WordPopup({ picked, meaning, close }: { picked: Picked; meaning?: Lesson["glossary"][number]; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" onClick={close}>
      <div className="paper w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog">
        <p className="kn text-4xl font-bold">{picked.word}</p>
        <p className="mt-1 text-lg italic text-gray-500">{transliterate(picked.word)}</p>
        {meaning ? (
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-500">Meaning (teacher&apos;s word list: {meaning.word})</p>
            <p className="kn text-lg">{meaning.meaningKn}</p>
            <p className="text-lg">{meaning.meaningEn}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">This word isn&apos;t in the word list. Here is the meaning of the whole sentence:</p>
        )}
        <p className="mt-3 rounded-xl bg-gray-50 p-3 text-gray-700">{picked.sentence.en}</p>
        <button onClick={close} className="btn btn-primary mt-5 w-full">Close</button>
      </div>
    </div>
  );
}
