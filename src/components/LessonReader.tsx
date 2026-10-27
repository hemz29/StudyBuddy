"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/content/schema";
import { transliterate } from "@/lib/transliterate";
import { KnText } from "@/components/Word";
import { LineIcon } from "@/components/LineIcon";
import audio from "@/content/audio.json";

// Sentences with recorded Kannada speech (made by scripts/tts.mjs), and the voices they were made with.
const HAS_AUDIO = new Set<string>(audio.sentences);
const VOICES = Object.keys(audio.voices) as ("female" | "male")[];

type Sentence = { id: string; kn: string; en: string };

const titleCase = (s: string) => s.replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase());

export function LessonReader({ lesson }: { lesson: Lesson }) {
  const [showTr, setShowTr] = useState(true);
  const [showEn, setShowEn] = useState(true);
  // Read aloud: one <audio> element plays a queue of sentences (one sentence, or a whole part).
  const [voice, setVoice] = useState<"female" | "male">(VOICES[0] ?? "female");
  const [queue, setQueue] = useState<string[]>([]);
  const player = useRef<HTMLAudioElement | null>(null);
  const playing = queue[0] ?? null;
  useEffect(() => {
    const a = player.current;
    if (!a) return;
    if (!playing) return a.pause();
    a.src = `/audio/${voice}/${playing}.mp3`;
    a.play().catch(() => setQueue([]));
  }, [playing, voice]);
  const play = (ids: string[]) => setQueue((q) => (q.length && q[0] === ids[0] ? [] : ids));
  const lessonHasAudio = [...lesson.intro, ...lesson.parts.flatMap((p) => p.sentences)].some((s) => HAS_AUDIO.has(s.id));

  const blocks: { heading?: { kn: string; en: string }; sentences: Sentence[]; intro?: boolean }[] = [
    ...(lesson.intro.length ? [{ heading: { kn: "ಪಾಠ ಪ್ರವೇಶ", en: "Introduction" }, sentences: lesson.intro, intro: true }] : []),
    ...lesson.parts,
  ];

  return (
    <div className="flex flex-col gap-5">
      <audio ref={player} onEnded={() => setQueue((q) => q.slice(1))} preload="none" />
      <Link href="/learn/lessons" className="text-sm font-bold text-accent">← Back</Link>
      <div className="card flex flex-wrap items-center gap-4 bg-white p-5">
        <div className="mr-auto">
          <h1 className="text-3xl font-bold"><KnText text={lesson.title.kn} /></h1>
          <p className="text-2xl font-bold">
            {titleCase(transliterate(lesson.title.kn.replace(/\s*\(.*\)\s*$/, "")))}{" "}
            <span className="font-normal text-muted">({lesson.kind})</span>
          </p>
          <p className="text-muted">
            {lesson.title.en}
            {lesson.author.en && ` · ${lesson.author.en}`}
          </p>
          <p className="mt-1 chip bg-good-soft text-good">From your teacher&apos;s notes</p>
        </div>
        <Toggle on={showTr} set={setShowTr} label="Sound it out (English letters)" />
        <Toggle on={showEn} set={setShowEn} label="English meaning" />
        {lessonHasAudio && VOICES.length > 1 && (
          <div className="flex rounded-full border border-line bg-white p-1 text-sm" role="group" aria-label="Voice">
            {VOICES.map((v) => (
              <button key={v} onClick={() => setVoice(v)} aria-pressed={voice === v} className={`rounded-full px-3 py-1 capitalize ${voice === v ? "bg-black text-[var(--brand-yellow)]" : "text-muted"}`}>
                {v} voice
              </button>
            ))}
          </div>
        )}
        <Link href={`/learn/cards/${lesson.id}`} className="btn btn-soft">Practise →</Link>
      </div>

      <p className="rounded-2xl bg-white/80 px-4 py-2 text-sm text-muted">
        Hover over (or tap) any Kannada word to see how to say it and what it means.{" "}
        Every meaning comes from the teacher&apos;s notes or has been <span className="chip bg-good-soft text-good">checked by a Kannada teacher</span>.
      </p>

      {blocks.map((b, bi) => (
        <section key={bi} className="paper overflow-hidden">
          {b.heading && (
            <h2 className="border-b border-gray-100 bg-gray-50 px-5 py-3 font-sans font-bold">
              <KnText text={b.heading.kn} /> <span className="text-gray-500">· {b.heading.en}</span>
              {b.sentences.some((x) => HAS_AUDIO.has(x.id)) && (
                <button
                  onClick={() => play(b.sentences.filter((x) => HAS_AUDIO.has(x.id)).map((x) => x.id))}
                  className="float-right flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-sm font-medium text-[var(--brand-yellow)]"
                >
                  <LineIcon name="sound" size={16} /> {b.sentences.some((x) => x.id === playing) && queue.length > 1 ? "Stop" : "Listen to this part"}
                </button>
              )}
            </h2>
          )}
          <ol className={lesson.kind === "poem" && !b.intro ? "py-2" : "divide-y divide-gray-100"}>
            {b.sentences.map((s) => (
              <li key={s.id} className={`grid gap-3 px-5 ${lesson.kind === "poem" && !b.intro ? "py-1.5" : "py-3"} ${showEn ? "md:grid-cols-2" : ""}`}>
                <div className={playing === s.id ? "-mx-2 rounded-xl bg-accent-soft px-2" : ""}>
                  <p className="text-[1.45rem] leading-relaxed">
                    {HAS_AUDIO.has(s.id) && (
                      <button
                        onClick={() => play([s.id])}
                        aria-label={playing === s.id ? "Stop" : "Listen"}
                        title={playing === s.id ? "Stop" : "Listen"}
                        className={`mr-2 inline-grid h-8 w-8 place-items-center rounded-full align-middle ${playing === s.id ? "bg-black text-[var(--brand-yellow)]" : "bg-[#f2f2f2] text-black hover:bg-black hover:text-white"}`}
                      >
                        <LineIcon name="sound" size={16} />
                      </button>
                    )}
                    <KnText text={s.kn} />
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
        <h2 className="text-lg"><KnText text="ಪದಗಳ ಅರ್ಥ" /> · Word meanings from your teacher&apos;s notes</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {lesson.glossary.map((g) => (
            <div key={g.word}>
              <dt className="text-xl font-bold"><KnText text={g.word} /> <span className="text-sm font-normal italic text-gray-500">{transliterate(g.word)}</span></dt>
              <dd className="text-gray-700"><KnText text={g.meaningKn} /> <span className="text-gray-500">· {g.meaningEn}</span></dd>
            </div>
          ))}
        </dl>
      </section>

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
