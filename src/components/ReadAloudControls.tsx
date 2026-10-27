"use client";
import { setReadAloud, SPEEDS, useReadAloud, VOICES } from "@/lib/readAloud";

const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);

// The voice (speaking-head icons) and speed for read-aloud, shared by every page and remembered in this browser.
export function ReadAloudControls() {
  const { voice, rate } = useReadAloud();
  return (
    <span className="flex items-center gap-1.5 font-medium">
      {VOICES.length > 1 &&
        VOICES.map((v) => (
          <button
            key={v}
            onClick={() => setReadAloud({ voice: v })}
            aria-pressed={voice === v}
            aria-label={`${titleCase(v)} voice`}
            title={`${titleCase(v)} voice`}
            className={`grid h-8 w-8 place-items-center rounded-full transition ${voice === v ? "bg-accent-soft ring-1 ring-[var(--brand-yellow)]" : "opacity-40 grayscale hover:opacity-80 hover:grayscale-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a tiny fixed-size icon */}
            <img src={`/icons/voice-${v}.png`} alt="" width={24} height={24} />
          </button>
        ))}
      <button
        onClick={() => setReadAloud({ rate: SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length] })}
        aria-label={`Speed ${rate}× (tap to change)`}
        title={`Speed ${rate}× (tap to change)`}
        className={`grid h-7 min-w-7 place-items-center rounded-full px-1 text-xs ${rate !== 1 ? "bg-black text-[var(--brand-yellow)]" : "text-muted hover:bg-white hover:text-black"}`}
      >
        {rate}×
      </button>
    </span>
  );
}
