import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, ownedSession } from "@/lib/server/api";
import { gradeSession } from "@/lib/server/pipeline";

export const maxDuration = 300;

const Body = z.object({
  // For each unsure reading: confirmed as read, or with a word replaced by one of the offered alternatives.
  confirmations: z.array(
    z.object({ attemptId: z.string(), replace: z.array(z.object({ word: z.string(), with: z.string() })).default([]) }),
  ),
});

// The child confirms what was read from their handwriting; then everything is marked.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  if (r.session.status !== "checking") return fail(409, "This worksheet isn't ready to mark yet.");
  const body = Body.safeParse(await req.json());
  if (!body.success) return fail(400, "Bad request");

  const attempts = await r.store.listSessionAttempts(r.parent.id, r.session.id);
  for (const c of body.data.confirmations) {
    const a = attempts.find((x) => x.id === c.attemptId);
    if (!a) continue;
    let text = a.text;
    for (const rep of c.replace) {
      // Only the AI's own alternative readings may be chosen, never free text.
      const allowed = a.uncertainWords.find((u) => u.word === rep.word)?.alternatives.includes(rep.with);
      if (allowed) text = text.replace(rep.word, rep.with);
    }
    await r.store.updateAttempt(r.parent.id, a.id, { text, readingConfirmed: true });
  }

  const after = await r.store.listSessionAttempts(r.parent.id, r.session.id);
  if (after.some((a) => !a.readingConfirmed)) return fail(409, "Some answers still need checking.");
  await gradeSession(r.store, { ...r.session });
  return NextResponse.json({ ok: true });
}
