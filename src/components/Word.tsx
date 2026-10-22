"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    const hide = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
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
      {open && ref.current && <MeaningPopover word={word} anchor={ref.current} />}
    </span>
  );
}

const GAP = 8;

// Rendered on <body> with fixed positioning, so cards with overflow-hidden can't clip it.
// Centred above the word, flipped below when there's no room, and kept inside the screen.
function MeaningPopover({ word, anchor }: { word: string; anchor: HTMLElement }) {
  const m = meaningOf(word);
  const box = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const a = anchor.getBoundingClientRect();
    const b = box.current!.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const left = Math.min(Math.max(a.left + a.width / 2 - b.width / 2, GAP), vw - b.width - GAP);
    const above = a.top - b.height - GAP;
    setPos({ left, top: above >= GAP ? above : a.bottom + GAP });
  }, [anchor, word]);

  return createPortal(
    <span
      ref={box}
      role="tooltip"
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
      className="pointer-events-none fixed z-50 flex w-max max-w-64 flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3 text-left font-sans text-sm leading-snug text-ink shadow-xl"
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
    </span>,
    document.body,
  );
}
