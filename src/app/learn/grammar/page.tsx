import { LESSONS } from "@/content";
import { ChoiceCard, PageHeader, type Tone } from "@/components/shell/PageHeader";

const TONES: Tone[] = ["peach", "sage", "sky"];

export default function Grammar() {
  return (
    <div>
      <PageHeader title="Grammar" sub="15 quick tap questions from one chapter. No writing needed – this is for practising on screen." />
      <div className="grid gap-5 md:grid-cols-3">
        {LESSONS.map((l, i) => (
          <ChoiceCard key={l.id} href={`/learn/cards/${l.id}`} tone={TONES[i % 3]} icon="✏️" title={<span className="kn">{l.title.kn}</span>} sub={`${l.title.en} · opposites, plurals, gender, meanings`} />
        ))}
      </div>
    </div>
  );
}
