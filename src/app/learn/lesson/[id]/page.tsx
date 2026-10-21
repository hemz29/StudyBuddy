import { notFound } from "next/navigation";
import { getLesson } from "@/content";
import { LessonReader } from "@/components/LessonReader";
import { requireChild, userStore } from "@/lib/server/context";
import { logActivity } from "@/lib/server/activity";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  const { parent, child } = await requireChild();
  await logActivity(await userStore(), parent.id, { kind: "lesson_view", path: `/learn/lesson/${lesson.id}`, childId: child.id });
  return <LessonReader lesson={lesson} />;
}
