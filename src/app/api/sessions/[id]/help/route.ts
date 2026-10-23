import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, ownedSession } from "@/lib/server/api";
import { getQuestion } from "@/content";
import { hint2, levelAfterPick } from "@/lib/help";

const Body = z.union([
  z.object({ questionId: z.string(), level: z.number().int().min(1).max(2) }),
  // The one pick allowed among Hint 2's choices.
  z.object({ questionId: z.string(), pick: z.string() }),
]);

// Records the highest hint opened for a question. Hint 1 is free; Hint 2 halves the marks for that answer (see lib/help).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const body = Body.safeParse(await req.json());
  if (!body.success) return fail(400, "Bad request");
  const { questionId } = body.data;
  const current = r.session.help[questionId] ?? 0;
  if ("pick" in body.data) {
    const q = getQuestion(questionId);
    if (!q) return fail(400, "Unknown question.");
    const correct = body.data.pick === hint2(q).correct;
    const next = levelAfterPick(current, correct);
    if (next === null) return fail(409, "Hint 2 allows one try, and it has been used.");
    await r.store.updateSession(r.parent.id, r.session.id, { help: { ...r.session.help, [questionId]: next } });
    return NextResponse.json({ correct, answer: hint2(q).correct });
  }
  const help = { ...r.session.help, [questionId]: Math.max(body.data.level, current) };
  await r.store.updateSession(r.parent.id, r.session.id, { help });
  return NextResponse.json({ ok: true });
}
