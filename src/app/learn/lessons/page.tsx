import { LESSONS } from "@/content";
import { ChoiceCard, PageHeader, type Tone } from "@/components/shell/PageHeader";
import { KindLabel } from "@/components/KindLabel";

const TONES: Tone[] = ["sage", "peach", "lavender"];

export default function Lessons() {
  return (
    <div>
      <PageHeader title="Read & Understand" sub="Hover over (or tap) any Kannada word to see how to say it and what it means." />
      <div className="grid gap-5 md:grid-cols-3">
        {LESSONS.map((l, i) => (
          <ChoiceCard key={l.id} href={`/learn/lesson/${l.id}`} tone={TONES[i % 3]} title={<span className="kn">{l.title.kn}</span>} sub={l.title.en} badge={<KindLabel kind={l.kind} />}>
            <span className="text-sm text-muted">by <span className="kn">{l.author.kn}</span> · {l.author.en}</span>
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
