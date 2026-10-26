"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aksharas, meaningOf, stripPunct } from "@/content/words";
import { transliterate } from "@/lib/transliterate";

const KANNADA = /[ಀ-೿]/;

// How a word responds: "normal" in reading and learning content (dotted underline; hover, or tap on a touch
// screen); "hover" inside links and buttons, so a tap still opens the link or picks the answer; "subtle" in
// site navigation, with no underline.
type Mode = "normal" | "hover" | "subtle";

// Kannada text where every word shows how to say it and what it means. Other text (English, numbers) is left as is.
export function KnText({ text, className = "", mode = "normal" }: { text: string; className?: string; mode?: Mode }) {
  const parts = text.split(/(\s+)/);
  return (
    <span className={className}>
      {parts.map((p, i) => (KANNADA.test(p) ? <Word key={i} raw={p} mode={mode} /> : p))}
    </span>
  );
}

export function Word({ raw, children, mode = "normal" }: { raw: string; children?: React.ReactNode; mode?: Mode }) {
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
      className="kn relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      {mode === "normal" ? (
        <span role="button" tabIndex={0} className="word" onClick={() => setOpen(true)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
          {children ?? raw}
        </span>
      ) : (
        <span className={mode === "hover" ? "word-hover" : "word-subtle"}>{children ?? raw}</span>
      )}
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
          <span className={`mt-1 w-max rounded-full px-2 py-0.5 text-[11px] font-bold ${m.source === "ai" ? "bg-lavender text-lavender-ink" : "bg-good-soft text-good"}`}>
            {m.source === "teacher" ? "From teacher's notes" : m.source === "checked" ? "Checked by a Kannada teacher" : `AI-suggested · ${m.confidence} confidence`}
          </span>
        </>
      ) : aksharas(word).length > 1 ? (
        <span className="mt-1 text-muted">Meaning not added yet.</span>
      ) : null}
    </span>,
    document.body,
  );
}
