"use client";
import { useEffect, useState } from "react";
import type { PracticeSession } from "@/lib/store/types";

const mmss = (ms: number) => {
  const s = Math.floor(Math.abs(ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Counts down from the worksheet's time (started at "I'm ready"). When time is up it says so gently and keeps
// counting the extra time, which parents see in the report; the child can always finish.
export function Timer({ session, minutes }: { session: PracticeSession; minutes: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(session.startedAt).getTime();
  const end = session.writingDoneAt ? new Date(session.writingDoneAt).getTime() : now;
  const left = start + minutes * 60_000 - end;
  const over = left < 0;
  const done = Boolean(session.writingDoneAt);

  return (
    <div
      role="timer"
      aria-live="off"
      className={`sticky top-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3 shadow-sm ${over ? "bg-peach" : "bg-white"}`}
    >
      <span className="text-2xl">{done ? "✅" : over ? "🔔" : "⏱️"}</span>
      <span className="text-3xl font-extrabold tabular-nums">{over ? `+${mmss(left)}` : mmss(left)}</span>
      <span className="text-sm text-muted">
        {done
          ? over
            ? `Finished writing ${mmss(left)} after the ${minutes} minutes.`
            : "Finished writing in time. Well done!"
          : over
            ? "Time's up! Finish calmly – the extra time is noted for your parent."
            : `left of ${minutes} minutes`}
      </span>
    </div>
  );
}
