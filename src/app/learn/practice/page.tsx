import { PRACTICE, TESTS } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { PageHeader } from "@/components/shell/PageHeader";
import { WorksheetList } from "@/components/WorksheetList";
import { doneCounts } from "@/lib/dashboard";

// Exam time: every worksheet in one place, for families who come just to practise papers.
export default async function Practice() {
  const { parent, child } = await requireChild();
  const done = doneCounts(await (await userStore()).listSessions(parent.id, child.id));
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Practice" sub="Exam coming up? Every worksheet is here. Write by hand, take a photo, and get it marked." back={null} />
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
