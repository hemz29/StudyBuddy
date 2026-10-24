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
  const done = sessions.filter((s) => s.kind === "worksheet" && s.status === "graded").length;

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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ChoiceCard href="/learn/lessons" tone="sage" icon={<LineIcon name="book" size={20} />} title="Read & Understand" sub="Stories and poems, every word explained" />
        <ChoiceCard href="/learn/grammar" tone="peach" icon={<LineIcon name="pen" size={20} />} title="Grammar" sub="Opposites, plurals, gender, meanings" />
        <ChoiceCard href="/learn/writing" tone="lavender" icon={<LineIcon name="page" size={20} />} title="Writing practice" sub="One chapter · 25 marks · 40 min" />
        <ChoiceCard href="/learn/tests" tone="sky" icon={<LineIcon name="star" size={20} />} title="Practice tests" sub="School paper · 40 marks · 1 hour" />
      </div>

      <Link href="/learn/letters" className="card flex items-center gap-3 px-4 py-3 transition hover:-translate-y-0.5">
        <span className="kn grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-xl" aria-hidden>ಅ</span>
        <span className="flex-1">
          <span className="block">Letters <KnText text="ಅಕ್ಷರ" mode="hover" /></span>
          <span className="text-sm text-muted">Alphabet, vowel signs, double letters, numbers</span>
        </span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
