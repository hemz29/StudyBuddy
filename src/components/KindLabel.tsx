import { transliterate } from "@/lib/transliterate";

// Shows the Kannada label the school uses, how to say it, and what it means.
const KINDS = { prose: { kn: "ಗದ್ಯ", en: "Prose (a story)" }, poem: { kn: "ಪದ್ಯ", en: "Poem" } } as const;

export function KindLabel({ kind }: { kind: keyof typeof KINDS }) {
  const k = KINDS[kind];
  return (
    <span className="flex flex-col items-end rounded-2xl bg-white/80 px-3 py-1 text-right leading-tight">
      <span className="kn text-base font-bold">{k.kn} <span className="font-sans text-xs font-normal italic text-muted">({transliterate(k.kn)})</span></span>
      <span className="text-xs text-muted">{k.en}</span>
    </span>
  );
}
