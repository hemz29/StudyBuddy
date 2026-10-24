import { LESSONS } from "@/content";
import { ChoiceCard, PageHeader, type Tone } from "@/components/shell/PageHeader";
import { KindLabel } from "@/components/KindLabel";
import { KnText } from "@/components/Word";

const TONES: Tone[] = ["sage", "peach", "lavender"];

export default function Lessons() {
  return (
    <div>
      <PageHeader title="Read & Understand" sub="Hover over (or tap) any Kannada word to see how to say it and what it means." />
      <div className="grid gap-5 md:grid-cols-3">
        {LESSONS.map((l, i) => (
          <ChoiceCard key={l.id} href={`/learn/lesson/${l.id}`} tone={TONES[i % 3]} eyebrow={`Chapter ${i + 1}`} title={<KnText text={l.title.kn} mode="hover" />} sub={l.title.en} badge={<KindLabel kind={l.kind} />}>
            {(l.author.kn || l.author.en) && (
              <span className="text-sm text-muted">by <KnText text={l.author.kn} mode="hover" />{l.author.kn && l.author.en ? " · " : ""}{l.author.en}</span>
            )}
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
