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
    <div className="flex flex-col gap-6">
      <section className="card flex items-center gap-5 bg-white/85 p-6 backdrop-blur">
        <AvatarImage avatar={child.theme} size={96} className="shrink-0" />
        <div>
          <h1 className="text-3xl">Hello, {child.nickname}!</h1>
          <p className="text-muted">{done ? `You've finished ${done} worksheet${done === 1 ? "" : "s"}. Keep going!` : "Small steps, big progress. Where shall we start?"}</p>
        </div>
        <span className="ml-auto hidden rounded-full bg-accent-soft px-4 py-2 text-accent sm:block"><KnText text="ಕಲಿಯೋಣ!" /></span>
      </section>

      {open[0] && (
        <Link href={`/learn/session/${open[0].id}`} className="card flex items-center justify-between gap-4 border-accent/40 bg-white/90 p-5">
          <div>
            <p className="text-sm font-bold text-muted">Continue where you stopped</p>
            <p className="text-lg font-extrabold">{getWorksheet(open[0].worksheetId)?.title.en}</p>
          </div>
          <span className="btn btn-primary">Continue</span>
        </Link>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <ChoiceCard href="/learn/lessons" tone="sage" icon={<LineIcon name="book" />} title="Read & Understand" sub="Stories and poems, with the meaning of every word" />
        <ChoiceCard href="/learn/grammar" tone="peach" icon={<LineIcon name="pen" />} title="Grammar" sub="Quick tap practice: opposites, plurals, gender, meanings" />
        <ChoiceCard href="/learn/writing" tone="lavender" icon={<LineIcon name="page" />} title="Writing practice" sub="One chapter at a time · 25 marks · 40 minutes" />
        <ChoiceCard href="/learn/tests" tone="sky" icon={<LineIcon name="star" />} title="Practice tests" sub="Like the school paper · 40 marks · 1 hour" />
      </div>

      <Link href="/learn/letters" className="card flex items-center gap-4 bg-white/85 p-4 transition hover:-translate-y-0.5">
        <span className="kn grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-2xl" aria-hidden>ಅ</span>
        <span className="flex-1">
          <span className="block text-lg">Letters <KnText text="ಅಕ್ಷರ" mode="hover" /></span>
          <span className="text-sm text-muted">The Kannada alphabet, vowel signs, double letters and number names</span>
        </span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
