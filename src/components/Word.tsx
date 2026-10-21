"use client";
import { useEffect, useRef, useState } from "react";
import { meaningOf, stripPunct } from "@/content/words";
import { transliterate } from "@/lib/transliterate";

const KANNADA = /[ಀ-೿]/;

// Kannada text where every word shows how to say it and what it means: on hover with a mouse, on tap on a touch screen.
export function KnText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <span className={`kn ${className}`}>
      {parts.map((p, i) => (KANNADA.test(p) ? <Word key={i} raw={p} /> : p))}
    </span>
  );
}

export function Word({ raw, children }: { raw: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const word = stripPunct(raw);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!word) return <>{raw}</>;
  return (
    <span
      ref={ref}
      className="relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <span role="button" tabIndex={0} className="word" onClick={() => setOpen(true)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
        {children ?? raw}
      </span>
      {open && <MeaningPopover word={word} />}
    </span>
  );
}

function MeaningPopover({ word }: { word: string }) {
  const m = meaningOf(word);
  return (
    <span
      role="tooltip"
      className="absolute bottom-full left-1/2 z-40 mb-2 flex w-max max-w-64 -translate-x-1/2 flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3 text-left font-sans text-sm leading-snug text-ink shadow-xl"
    >
      <span className="kn text-lg font-bold leading-tight">{word}</span>
      <span className="italic text-muted">{transliterate(word)}</span>
      {m ? (
        <>
          <span className="mt-1 text-base font-bold">{m.en}</span>
          {m.meaningKn && <span className="kn text-muted">{m.meaningKn}</span>}
          {m.base && m.base !== word && (
            <span className="text-xs text-muted">
              from <span className="kn">{m.base}</span>
              {m.baseEn ? ` = ${m.baseEn}` : ""}
            </span>
          )}
          <span className={`mt-1 w-max rounded-full px-2 py-0.5 text-[11px] font-bold ${m.source === "teacher" ? "bg-good-soft text-good" : "bg-lavender text-lavender-ink"}`}>
            {m.source === "teacher" ? "From teacher's notes" : `AI-suggested · ${m.confidence} confidence`}
          </span>
        </>
      ) : (
        <span className="mt-1 text-muted">Meaning not added yet.</span>
      )}
    </span>
  );
}
