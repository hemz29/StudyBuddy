import { notFound } from "next/navigation";
import { getLesson } from "@/content";
import { LessonReader } from "@/components/LessonReader";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  return <LessonReader lesson={lesson} />;
}
