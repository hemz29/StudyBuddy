import { LESSONS } from "@/content";
import { ChoiceCard, PageHeader, type Tone } from "@/components/shell/PageHeader";
import { KnText } from "@/components/Word";
import { LineIcon } from "@/components/LineIcon";

const TONES: Tone[] = ["peach", "sage", "sky"];

export default function Grammar() {
  return (
    <div>
      <PageHeader title="Grammar" sub="15 quick tap questions from one chapter. No writing needed – this is for practising on screen." />
      <div className="grid gap-5 md:grid-cols-3">
        {LESSONS.map((l, i) => (
          <ChoiceCard key={l.id} href={`/learn/cards/${l.id}`} tone={TONES[i % 3]} icon={<LineIcon name="pen" />} title={<KnText text={l.title.kn} mode="hover" />} sub={`${l.title.en} · opposites, plurals, gender, meanings`} />
        ))}
      </div>
    </div>
  );
}
