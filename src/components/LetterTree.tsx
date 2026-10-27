"use client";
import { useState } from "react";
import { transliterate } from "@/lib/transliterate";
import { KnText } from "@/components/Word";
import { LineIcon } from "@/components/LineIcon";
import { playWord, wordsWithAudio } from "@/lib/readAloud";
import { ALPHABET_TREE, SOUNDS_LIKE, countLetters, type TreeNode } from "@/content/grade6/alphabet";

// The textbook's ವರ್ಣಮಾಲೆ tree, to explore: tap a branch to open it, tap a letter to hear how it's said.
export function LetterTree() {
  const branches = ALPHABET_TREE.children!;
  const [open, setOpen] = useState(0);
  const [letter, setLetter] = useState<string | null>(null);
  const [canHear, setCanHear] = useState(false);
  const branch = branches[open];
  // Picking a letter also says it, when there's a recording for it.
  const pick = (l: string) => {
    setLetter(l);
    wordsWithAudio().then((w) => {
      setCanHear(w.has(l));
      if (w.has(l)) playWord(l);
    });
  };

  return (
    <div className="flex flex-col items-center gap-0">
      <Pill node={ALPHABET_TREE} root />
      <Stem />
      {/* The three main branches, joined to the root by one line. */}
      <div className="relative grid w-full max-w-3xl grid-cols-3 gap-2 pt-3 before:absolute before:top-0 before:right-[16.66%] before:left-[16.66%] before:h-px before:bg-black/30">
        {branches.map((b, i) => (
          <button
            key={b.kn}
            onClick={() => { setOpen(i); setLetter(null); }}
            aria-pressed={open === i}
            className={`relative flex min-w-0 flex-col items-center rounded-2xl border px-1.5 py-3 text-center transition before:absolute before:-top-3 before:h-3 before:w-px before:bg-black/30 ${open === i ? "border-[var(--brand-yellow)] bg-accent-soft" : "border-line bg-white hover:border-black"}`}
          >
            <KnText text={b.kn} mode="hover" className="kn text-sm font-semibold [overflow-wrap:anywhere] sm:text-lg" />
            <span className="text-xs text-muted">{b.en} · {countLetters(b)}</span>
          </button>
        ))}
      </div>
      <Stem />

      {/* The open branch, all the way down to its letters. */}
      <div className="w-full max-w-3xl rounded-[var(--radius)] border border-line bg-white p-4">
        {branch.note && <p className="mb-3 text-center text-sm text-muted"><KnText text={branch.note} /></p>}
        {/* A branch with sub-groups (ವರ್ಗೀಯ) gets the full width so its three columns have room. */}
        <div className={`grid gap-3 ${branch.children!.some((c) => c.children) ? "" : branch.children!.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {branch.children!.map((c) => <Branch key={c.kn} node={c} pick={pick} picked={letter} />)}
        </div>
      </div>

      <p className="mt-3 min-h-10 text-center text-sm" aria-live="polite">
        {letter ? (
          <>
            {canHear && (
              <button onClick={() => playWord(letter)} aria-label="Hear it again" title="Hear it again" className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-black align-middle text-[var(--brand-yellow)]">
                <LineIcon name="sound" size={16} />
              </button>
            )}
            <span className="kn mr-2 text-2xl font-bold align-middle">{letter}</span>
            <b>{transliterate(letter)}</b>
            {SOUNDS_LIKE[letter] && <span className="ml-2 rounded-md bg-accent-soft px-1.5 py-0.5">like {SOUNDS_LIKE[letter]}</span>}
          </>
        ) : (
          <span className="text-muted">Tap a branch above, then tap any letter to hear how it&apos;s said.</span>
        )}
      </p>
    </div>
  );
}

function Branch({ node, pick, picked }: { node: TreeNode; pick: (l: string) => void; picked: string | null }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#f7f7f7] p-3">
      <div className="text-center">
        <KnText text={node.kn} className="kn font-semibold" />
        <span className="text-xs text-muted"> · {node.en}{countLetters(node) ? ` · ${countLetters(node)}` : ""}</span>
        {node.note && <p className="text-xs text-muted"><KnText text={node.note} /></p>}
      </div>
      {node.children && (
        <div className="grid gap-2 border-t border-black/10 pt-2 sm:grid-cols-3">
          {node.children.map((c) => <Branch key={c.kn} node={c} pick={pick} picked={picked} />)}
        </div>
      )}
      {(node.letters || node.examples) && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {node.letters?.map((l) => (
            <button
              key={l}
              onClick={() => pick(l)}
              aria-label={`${l}, ${transliterate(l)}`}
              className={`kn grid h-11 min-w-11 place-items-center rounded-xl border px-1.5 text-xl font-bold transition ${picked === l ? "border-black bg-black text-[var(--brand-yellow)]" : "border-line bg-white hover:border-black"}`}
            >
              {l}
            </button>
          ))}
          {node.examples?.map((l) => <span key={l} className="kn grid h-11 place-items-center rounded-xl border border-dashed border-black/20 px-2 text-lg text-muted">{l}</span>)}
        </div>
      )}
    </div>
  );
}

function Pill({ node, root }: { node: TreeNode; root?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl px-5 py-2 ${root ? "bg-black text-white" : "bg-white"}`}>
      <KnText text={node.kn} className="kn text-xl font-semibold text-[var(--brand-yellow)]" />
      <span className="text-xs text-gray-300">{node.en} · {countLetters(node)} letters</span>
    </div>
  );
}

const Stem = () => <span aria-hidden className="h-3 w-px bg-black/30" />;
