"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Lesson } from "@/content/schema";
import { transliterate } from "@/lib/transliterate";
import { KnText } from "@/components/Word";
import { LineIcon } from "@/components/LineIcon";
import audio from "@/content/audio.json";

// Sentences with recorded Kannada speech (made by scripts/tts.mjs) as "<lessonId>/<sentenceId>", and the voices they were made with.
const HAS_AUDIO = new Set<string>(audio.sentences);
const VOICES = Object.keys(audio.voices) as ("female" | "male")[];
// Slow playback for careful listening. Browsers keep the pitch when slowing down, so the voice stays natural.
const SLOW = 0.5;

type Sentence = { id: string; kn: string; en: string };

const titleCase = (s: string) => s.replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase());

export function LessonReader({ lesson }: { lesson: Lesson }) {
  const [showTr, setShowTr] = useState(true);
  const [showEn, setShowEn] = useState(true);
  // Read aloud: one <audio> element plays a queue of sentences (one sentence, or a whole part).
  const [voice, setVoice] = useState<"female" | "male">(VOICES[0] ?? "female");
  const [slow, setSlow] = useState(false);
  const rate = slow ? SLOW : 1;
  const [queue, setQueue] = useState<string[]>([]);
  const player = useRef<HTMLAudioElement | null>(null);
  const playing = queue[0] ?? null;
  const key = (id: string) => `${lesson.id}/${id}`;
  useEffect(() => {
    const a = player.current;
    if (!a) return;
    if (!playing) return a.pause();
    a.src = `/audio/${voice}/${playing}.mp3`;
    a.play().catch(() => setQueue([]));
  }, [playing, voice]);
  useEffect(() => {
    const a = player.current;
    if (!a) return;
    a.preservesPitch = true;
    a.defaultPlaybackRate = a.playbackRate = rate; // the default carries over to the next sentence's file
  }, [rate]);
  const play = (ids: string[]) => setQueue((q) => (q.length && q[0] === ids[0] ? [] : ids));

  const blocks: { heading?: { kn: string; en: string }; sentences: Sentence[]; intro?: boolean }[] = [
    ...(lesson.intro.length ? [{ heading: { kn: "ಪಾಠ ಪ್ರವೇಶ", en: "Introduction" }, sentences: lesson.intro, intro: true }] : []),
    ...lesson.parts,
  ];

  return (
    <div className="flex flex-col gap-5">
      <audio ref={player} onEnded={() => setQueue((q) => q.slice(1))} preload="none" />
      <Link href="/learn/lessons" className="text-sm font-bold text-accent">← Back</Link>
      <div className="card bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="mr-auto">
            <h1 className="text-3xl font-bold"><KnText text={lesson.title.kn} /></h1>
            <p className="mt-1 text-xl font-bold">
              {titleCase(transliterate(lesson.title.kn.replace(/\s*\(.*\)\s*$/, "")))}{" "}
              <span className="font-normal text-muted">({lesson.kind})</span>
            </p>
            {lesson.author.en && <p className="mt-0.5 text-sm text-muted">{lesson.author.en}</p>}
          </div>
          <Link href={`/learn/cards/${lesson.id}`} className="btn btn-soft max-sm:!hidden">Practise →</Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Toggle on={showTr} set={setShowTr} label="Sound it out" title="Kannada written in English letters" />
          <Toggle on={showEn} set={setShowEn} label="English meaning" />
          <p className="text-sm text-muted sm:ml-3">
            Tap any word for its sound and meaning · <span className="text-good">checked by a Kannada teacher</span>
          </p>
        </div>
      </div>

      {blocks.map((b, bi) => (
        <section key={bi} className="paper overflow-hidden">
          {b.heading && (
            <h2 className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-gray-100 bg-gray-50 px-5 py-3 font-sans font-bold">
              <span><KnText text={b.heading.kn} /> <span className="text-gray-500">· {b.heading.en}</span></span>
              {b.sentences.some((x) => HAS_AUDIO.has(key(x.id))) && (
                <span className="ml-auto flex items-center gap-1.5 font-medium">
                  {VOICES.length > 1 && VOICES.map((v) => (
                    <IconButton key={v} on={voice === v} onClick={() => setVoice(v)} label={`${titleCase(v)} voice`}>
                      <LineIcon name={v} size={16} />
                    </IconButton>
                  ))}
                  <IconButton on={slow} onClick={() => setSlow(!slow)} label={`Slow (${SLOW}×)`}>
                    <span className="text-xs">{SLOW}×</span>
                  </IconButton>
                  <button
                    onClick={() => play(b.sentences.filter((x) => HAS_AUDIO.has(key(x.id))).map((x) => key(x.id)))}
                    className="ml-1 flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-sm text-[var(--brand-yellow)]"
                  >
                    <LineIcon name="sound" size={16} /> {b.sentences.some((x) => key(x.id) === playing) && queue.length > 1 ? "Stop" : "Listen to this part"}
                  </button>
                </span>
              )}
            </h2>
          )}
          <ol className={lesson.kind === "poem" && !b.intro ? "py-2" : "divide-y divide-gray-100"}>
            {b.sentences.map((s) => (
              <li key={s.id} className={`grid gap-3 px-5 ${lesson.kind === "poem" && !b.intro ? "py-1.5" : "py-3"} ${showEn ? "md:grid-cols-2" : ""}`}>
                <div className={playing === key(s.id) ? "-mx-2 rounded-xl bg-accent-soft px-2" : ""}>
                  <p className="text-[1.45rem] leading-relaxed">
                    {HAS_AUDIO.has(key(s.id)) && (
                      <button
                        onClick={() => play([key(s.id)])}
                        aria-label={playing === key(s.id) ? "Stop" : "Listen"}
                        title={playing === key(s.id) ? "Stop" : "Listen"}
                        className={`mr-2 inline-grid h-8 w-8 place-items-center rounded-full align-middle ${playing === key(s.id) ? "bg-black text-[var(--brand-yellow)]" : "bg-[#f2f2f2] text-black hover:bg-black hover:text-white"}`}
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

      <Link href={`/learn/cards/${lesson.id}`} className="btn btn-primary self-center px-8">Done reading? Practise this lesson →</Link>
    </div>
  );
}

function Toggle({ on, set, label, title }: { on: boolean; set: (v: boolean) => void; label: string; title?: string }) {
  return (
    <button onClick={() => set(!on)} title={title} aria-pressed={on} className={`rounded-full border px-3 py-1 text-sm ${on ? "border-black bg-black text-[var(--brand-yellow)]" : "border-line bg-white text-muted hover:border-black"}`}>
      {label}
    </button>
  );
}

function IconButton({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} aria-label={label} title={label} className={`grid h-7 w-7 place-items-center rounded-full ${on ? "bg-black text-[var(--brand-yellow)]" : "text-muted hover:bg-white hover:text-black"}`}>
      {children}
    </button>
  );
}
