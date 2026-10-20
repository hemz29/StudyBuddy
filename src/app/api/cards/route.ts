import { NextResponse } from "next/server";
import { z } from "zod";
import { MARKING, getQuestion } from "@/content";
import { getActiveChild, getParent, userStore } from "@/lib/server/context";

const Body = z.object({
  lessonId: z.string(),
  results: z.array(z.object({ questionId: z.string(), correct: z.boolean() })).max(50),
});

// Saves a finished set of practice cards so it shows in the dashboard's skill view.
export async function POST(req: Request) {
  const parent = await getParent();
  if (!parent) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const child = await getActiveChild(parent.id);
  if (!child) return NextResponse.json({ error: "No child selected" }, { status: 400 });
  const body = Body.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const store = await userStore();
  const results = body.data.results.filter((r) => getQuestion(r.questionId));
  const awarded = results.filter((r) => r.correct).length;
  const session = await store.createSession({
    parentId: parent.id,
    childId: child.id,
    kind: "cards",
    worksheetId: `cards:${body.data.lessonId}`,
    retryOf: null,
    status: "graded",
    markingVersion: MARKING.version,
    help: {},
    awarded,
    max: results.length,
    completedAt: new Date().toISOString(),
  });
  await store.replaceAttempts(
    parent.id,
    session.id,
    results.map((r) => {
      const q = getQuestion(r.questionId)!;
      return {
        sessionId: session.id,
        parentId: parent.id,
        childId: child.id,
        questionId: q.id,
        type: q.type,
        skill: q.skill,
        pageId: null,
        region: null,
        text: "",
        confidence: "high" as const,
        uncertainWords: [],
        readingConfirmed: true,
        misreadFlagged: false,
        helpLevel: 0,
        awarded: r.correct ? 1 : 0,
        max: 1,
        status: r.correct ? ("correct" as const) : ("incorrect" as const),
        method: "key" as const,
        feedback: null,
        markingVersion: MARKING.version,
      };
    }),
  );
  return NextResponse.json({ ok: true });
}
