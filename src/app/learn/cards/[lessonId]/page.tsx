import { notFound } from "next/navigation";
import { getLesson } from "@/content";
import type { QuestionType } from "@/content/schema";
import { PracticeCards, type Card } from "@/components/PracticeCards";

const CARD_TYPES: Partial<Record<QuestionType, string>> = {
  opposite: "Choose the opposite word",
  plural: "Choose the plural",
  gender: "Change the gender",
  meaning_kn: "Choose the meaning",
  split: "How does this word split?",
  rhyme: "Which word rhymes in the poem?",
};

function shuffle<T>(xs: T[], seed: number) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function CardsPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = getLesson((await params).lessonId);
  if (!lesson) notFound();

  // Tap-to-answer drills built from the teacher's key: the wrong options are other answers from the same exercise.
  const cards: Card[] = [];
  for (const ex of lesson.exercises) {
    const label = CARD_TYPES[ex.type];
    if (!label) continue;
    const pool = [...new Set(ex.questions.map((q) => q.answers[0]))];
    ex.questions.forEach((q, i) => {
      const wrong = shuffle(pool.filter((a) => a !== q.answers[0]), i + 7).slice(0, 3);
      cards.push({
        questionId: q.id,
        skill: q.skill,
        type: q.type,
        label,
        prompt: q.prompt,
        correct: q.answers[0],
        options: shuffle([q.answers[0], ...wrong], i + 3),
      });
    });
  }

  return <PracticeCards lessonId={lesson.id} title={lesson.title} cards={shuffle(cards, 11).slice(0, 15)} />;
}
