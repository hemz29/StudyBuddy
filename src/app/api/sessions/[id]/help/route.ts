import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, ownedSession } from "@/lib/server/api";

const Body = z.object({ questionId: z.string(), level: z.number().int().min(1).max(4) });

// Records the highest "I'm stuck" step opened for a question. Help never changes marks.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const body = Body.safeParse(await req.json());
  if (!body.success) return fail(400, "Bad request");
  const { questionId, level } = body.data;
  const help = { ...r.session.help, [questionId]: Math.max(level, r.session.help[questionId] ?? 0) };
  await r.store.updateSession(r.parent.id, r.session.id, { help });
  return NextResponse.json({ ok: true });
}
