"use client";
import { useEffect, useState } from "react";
import { readStats, type LocalStats } from "@/lib/localStats";

const PAGES: Record<string, string> = {
  lessons: "Lesson list",
  letters: "Alphabets",
  grammar: "Grammar",
  numbers: "Numbers",
  writing: "Writing practice",
  tests: "Practice tests",
  worksheet: "Worksheets",
  practice: "Practice",
  scores: "My scores",
};

const minutes = (sec: number) => (sec < 60 ? (sec ? "<1 min" : "0 min") : sec < 3600 ? `${Math.round(sec / 60)} min` : `${(sec / 3600).toFixed(1)} h`);
const dayKey = (d: Date) => d.toLocaleDateString("en-CA");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// What this browser counted for the child (see lib/localStats), shown even when progress isn't saved to an account.
export function DeviceStats({ childId, nickname, lessonTitles }: { childId: string; nickname: string; lessonTitles: Record<string, string> }) {
  const [s, setS] = useState<LocalStats | null | undefined>(undefined);
  useEffect(() => setS(readStats(childId)), [childId]);
  if (s === undefined) return null; // first render on the server: storage isn't readable there

  const week = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return { label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), sec: s?.days[dayKey(d)] ?? 0 };
  });
  const weekSec = week.reduce((t, d) => t + d.sec, 0);
  const totalSec = Object.values(s?.days ?? {}).reduce((t, x) => t + x, 0);
  const words = Object.entries(s?.lookedUp ?? {}).sort((a, b) => b[1] - a[1]);
  const listened = Object.values(s?.listened ?? {}).reduce((t, x) => t + x, 0);
  const lessons = Object.keys(lessonTitles)
    .map((id) => ({ id, title: lessonTitles[id], opened: s?.pages[`lesson:${id}`] ?? 0, listened: s?.listened[id] ?? 0, cards: s?.cards.filter((c) => c.lessonId === id).at(-1) }))
    .filter((l) => l.opened || l.listened || l.cards);
  const other = Object.entries(PAGES).filter(([k]) => s?.pages[k]).map(([k, label]) => ({ label, n: s!.pages[k] }));

  return (
    <section className="card bg-white p-5">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 className="text-lg font-bold">On this device</h2>
        <p className="text-sm text-muted">Counted in this browser only, so it shows even if progress isn&apos;t saved. Other devices and cleared browser data aren&apos;t included.</p>
      </div>

      {!s ? (
        <p className="mt-3 rounded-xl bg-accent-soft p-4 text-sm">Nothing counted on this browser yet. Once {nickname} reads, listens or practises here, it shows up straight away.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Learning time this week" value={minutes(weekSec)} note={`${minutes(totalSec)} since ${new Date(s.firstAt).toLocaleDateString("en-IN")}`} />
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-bold text-muted">Days practised</p>
              <p className="mt-1 text-3xl font-extrabold">{week.filter((d) => d.sec).length}<span className="text-base font-normal text-muted"> of 7</span></p>
              <div className="mt-2 flex gap-1.5" aria-hidden>
                {week.map((d, i) => (
                  <span key={i} className="flex flex-col items-center gap-0.5 text-[10px] text-muted">
                    <span className={`h-3 w-3 rounded-full ${d.sec ? "bg-black" : "bg-line"}`} />
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
            <Tile label="Words looked up" value={String(words.length)} note={`${plural(words.reduce((t, [, n]) => t + n, 0), "look-up")} in all`} />
            <Tile label="Listened to" value={String(listened)} note={`${listened === 1 ? "sentence" : "sentences"} read aloud · ${plural(s.wordsHeard, "single word")}`} />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-bold">What {nickname} opened</h3>
              {lessons.length + other.length === 0 ? (
                <p className="mt-1 text-sm text-muted">No learning pages opened yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {lessons.map((l) => (
                    <li key={l.id} className="flex flex-wrap justify-between gap-x-3 py-2">
                      <span className="font-medium">{l.title}</span>
                      <span className="text-muted">
                        {[l.opened && `read ${l.opened}×`, l.listened && `${plural(l.listened, "sentence")} heard`, l.cards && `cards ${l.cards.right}/${l.cards.total}`].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                  {other.map((o) => (
                    <li key={o.label} className="flex justify-between gap-3 py-2">
                      <span className="font-medium">{o.label}</span>
                      <span className="text-muted">opened {o.n}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-bold">Words looked up most</h3>
              <p className="text-sm text-muted">Often a sign of a word that&apos;s still tricky.</p>
              {words.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {words.slice(0, 12).map(([w, n]) => (
                    <span key={w} className="kn rounded-full bg-accent-soft px-3 py-1">
                      {w} <span className="font-sans text-xs text-muted">×{n}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">None yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}
