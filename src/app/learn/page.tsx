import Link from "next/link";
import { getWorksheet } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { AvatarImage } from "@/components/AvatarImage";
import { ChoiceCard } from "@/components/shell/PageHeader";
import { KnText } from "@/components/Word";
import { LineIcon } from "@/components/LineIcon";

export default async function LearnHome() {
  const { parent, child } = await requireChild();
  const sessions = await (await userStore()).listSessions(parent.id, child.id);
  const open = sessions
    .filter((s) => s.kind === "worksheet" && s.status !== "graded" && !getWorksheet(s.worksheetId)?.retired)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const graded = sessions
    .filter((s) => s.kind === "worksheet" && s.status === "graded")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const done = graded.length;
  const latestPct = graded[0]?.max ? Math.round(((graded[0].awarded ?? 0) / graded[0].max) * 100) : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex items-center gap-3 px-4 py-3">
        <AvatarImage avatar={child.theme} size={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl leading-tight">Hello, {child.nickname}</h1>
          <p className="truncate text-sm text-muted">
            {open[0] ? `Continue: ${getWorksheet(open[0].worksheetId)?.title.en}` : done ? `${done} worksheet${done === 1 ? "" : "s"} finished. Keep going!` : "Small steps, big progress."}
          </p>
        </div>
        {open[0] ? (
          <Link href={`/learn/session/${open[0].id}`} className="btn btn-primary shrink-0">Continue →</Link>
        ) : (
          <span className="hidden rounded-full bg-accent-soft px-3 py-1 text-sm text-accent sm:block"><KnText text="ಕಲಿಯೋಣ!" /></span>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[3fr_1fr]">
        <div className="flex flex-col gap-4">
          <Group title="Learn">
            <ChoiceCard href="/learn/lessons" tone="sage" icon={<LineIcon name="book" size={20} />} title="Read & Understand" sub="Stories and poems, every word explained" />
            <ChoiceCard href="/learn/grammar" tone="peach" icon={<LineIcon name="pen" size={20} />} title="Grammar" sub="Opposites, plurals, gender, meanings" />
            <ChoiceCard href="/learn/letters" tone="lavender" icon={<span className="kn text-lg" aria-hidden>ಅ</span>} title={<>Letters <KnText text="ಅಕ್ಷರ" mode="hover" /></>} sub="Alphabet, vowel signs, numbers" />
          </Group>
          <Group title="Practise">
            <ChoiceCard href="/learn/writing" tone="lavender" icon={<LineIcon name="page" size={20} />} title="Writing practice" sub="One chapter · 25 marks · 40 min" />
            <ChoiceCard href="/learn/tests" tone="sky" icon={<LineIcon name="star" size={20} />} title="Practice tests" sub="School paper · 40 marks · 1 hour" />
            <ChoiceCard tone="peach" icon={<LineIcon name="sound" size={20} />} title="Practise speaking" sub="Say words and sentences aloud" />
          </Group>
        </div>
        <Group title="My progress" single>
          <ChoiceCard href="/learn/scores" tone="sage" icon={<LineIcon name="trophy" size={20} />} title="My scores" sub="See how you're doing">
            <span className="mt-2 text-4xl font-light">{latestPct === null ? "–" : `${latestPct}%`}</span>
            <span className="text-xs text-muted">{latestPct === null ? "Finish a worksheet to see your score" : "Latest worksheet"}</span>
            <span className="text-sm">{done} worksheet{done === 1 ? "" : "s"} finished</span>
          </ChoiceCard>
        </Group>
      </div>
    </div>
  );
}

function Group({ title, single, children }: { title: string; single?: boolean; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
      <div className={single ? "grid flex-1" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>{children}</div>
    </section>
  );
}
