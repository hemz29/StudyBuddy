import { LineIcon } from "@/components/LineIcon";
import { PRACTICE, TESTS } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { WorksheetList } from "@/components/WorksheetList";
import { doneCounts } from "@/lib/dashboard";

// Exam time: every worksheet in one place, for families who come just to practise papers.
export default async function Practice() {
  const { parent, child } = await requireChild();
  const done = doneCounts(await (await userStore()).listSessions(parent.id, child.id));
  return (
    <div className="flex flex-col gap-8">
      {/* A soft yellow band so the page's purpose stands out without shouting. */}
      <header className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--brand-yellow)]/60 bg-accent-soft p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Exam coming up?</p>
        <h1 className="text-3xl">Practice</h1>
        <p>Every worksheet and test is here, in the school&apos;s paper format.</p>
        <ol className="mt-1 flex flex-wrap gap-2 text-sm">
          {([["pen", "Write by hand"], ["camera", "Take a photo"], ["check", "Get it marked"]] as const).map(([icon, label], i) => (
            <li key={label} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-xs font-semibold text-[var(--brand-yellow)]">{i + 1}</span>
              <LineIcon name={icon} size={18} /> {label}
            </li>
          ))}
        </ol>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl">Practice tests</h2>
        <p className="text-muted">Like the school&apos;s Term 1 paper: Section A and B, 40 marks, 1 hour.</p>
        <WorksheetList worksheets={TESTS} done={done} tone="sky" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl">Chapter worksheets</h2>
        <p className="text-muted">One chapter at a time: 25 marks in 40 minutes.</p>
        <WorksheetList worksheets={PRACTICE} done={done} tone="lavender" />
      </section>
    </div>
  );
}
