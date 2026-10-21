import { PRACTICE } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { PageHeader } from "@/components/shell/PageHeader";
import { WorksheetList } from "@/components/WorksheetList";
import { doneCounts } from "@/lib/dashboard";

export default async function Writing() {
  const { parent, child } = await requireChild();
  const done = doneCounts(await (await userStore()).listSessions(parent.id, child.id));
  return (
    <div>
      <PageHeader title="Writing practice" sub="One chapter at a time. Print it, write by hand, then take a photo. 25 marks in 40 minutes." />
      <WorksheetList worksheets={PRACTICE} done={done} tone="lavender" />
    </div>
  );
}
