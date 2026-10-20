import { notFound } from "next/navigation";
import { getWorksheet } from "@/content";
import { requireChild, userStore } from "@/lib/server/context";
import { SessionView } from "@/components/session/SessionView";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { parent } = await requireChild();
  const session = await (await userStore()).getSession(parent.id, (await params).id);
  if (!session || !getWorksheet(session.worksheetId)) notFound();
  return <SessionView sessionId={session.id} worksheetId={session.worksheetId} />;
}
