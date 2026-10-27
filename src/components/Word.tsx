"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aksharas, meaningOf, stripPunct } from "@/content/words";
import { transliterate } from "@/lib/transliterate";
import { LineIcon } from "@/components/LineIcon";

const KANNADA = /[ಀ-೿]/;

// How a word responds: "normal" in reading and learning content (dotted underline; hover, or tap on a touch
// screen); "hover" inside links and buttons, so a tap still opens the link or picks the answer; "subtle" in
// site navigation, with no underline.
type Mode = "normal" | "hover" | "subtle";

// Set around a sentence that has read-aloud audio: called with a word's position to read aloud from that word on.
export const ReadFromContext = createContext<((wordIndex: number) => void) | null>(null);

// Kannada text where every word shows how to say it and what it means. Other text (English, numbers) is left as is.
// Words are numbered by their place among the space-separated pieces, the same way scripts/tts.mjs numbers them.
export function KnText({ text, className = "", mode = "normal" }: { text: string; className?: string; mode?: Mode }) {
  const parts = text.split(/(\s+)/);
  let n = -1;
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p && !/^\s+$/.test(p)) n++;
        return KANNADA.test(p) ? <Word key={i} raw={p} mode={mode} index={n} /> : p;
      })}
    </span>
  );
}

export function Word({ raw, children, mode = "normal", index }: { raw: string; children?: React.ReactNode; mode?: Mode; index?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const pointer = useRef("mouse");
  const word = stripPunct(raw);
  // With a mouse, hovering shows the meaning, so a click reads aloud from here; on touch, the popover offers it.
  const readFrom = useContext(ReadFromContext);
  const read = readFrom && index !== undefined && mode === "normal" ? () => readFrom(index) : null;

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && !(e.target as Element).closest?.("[data-word-popover]") && setOpen(false);
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
      className="kn relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      {mode === "normal" ? (
        <span
          role="button"
          tabIndex={0}
          className="word"
          onPointerDown={(e) => (pointer.current = e.pointerType)}
          onClick={() => (read && pointer.current === "mouse" ? read() : setOpen(true))}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {children ?? raw}
        </span>
      ) : (
        <span className={mode === "hover" ? "word-hover" : "word-subtle"}>{children ?? raw}</span>
      )}
      {open && ref.current && (
        <MeaningPopover word={word} anchor={ref.current} read={read} touch={pointer.current !== "mouse"} close={() => setOpen(false)} />
      )}
    </span>
  );
}

const GAP = 8;

// Rendered on <body> with fixed positioning, so cards with overflow-hidden can't clip it.
// Centred above the word, flipped below when there's no room, and kept inside the screen.
function MeaningPopover({ word, anchor, read, touch, close }: { word: string; anchor: HTMLElement; read: (() => void) | null; touch: boolean; close: () => void }) {
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
      data-word-popover
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
      className={`${read && touch ? "" : "pointer-events-none "}fixed z-50 flex w-max max-w-64 flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3 text-left font-sans text-sm leading-snug text-ink shadow-xl`}
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
          <span className={`mt-1 w-max rounded-full px-2 py-0.5 text-[11px] font-bold ${m.source === "ai" ? "bg-lavender text-lavender-ink" : "bg-good-soft text-good"}`}>
            {m.source === "teacher" ? "From teacher's notes" : m.source === "checked" ? "Checked by a Kannada teacher" : `AI-suggested · ${m.confidence} confidence`}
          </span>
        </>
      ) : aksharas(word).length > 1 ? (
        <span className="mt-1 text-muted">Meaning not added yet.</span>
      ) : null}
      {read &&
        (touch ? (
          <button onClick={() => { read(); close(); }} className="mt-2 flex w-max items-center gap-1.5 rounded-full bg-black px-3 py-1 text-sm text-[var(--brand-yellow)]">
            <LineIcon name="sound" size={14} /> Read from here
          </button>
        ) : (
          <span className="mt-1 text-xs text-muted">Click to read aloud from here</span>
        ))}
    </span>,
    document.body,
  );
}
