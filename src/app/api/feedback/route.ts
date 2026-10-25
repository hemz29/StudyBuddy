import { NextResponse } from "next/server";
import { z } from "zod";
import { getParent } from "@/lib/server/context";
import { saveFeedback } from "@/lib/server/feedback";
import { INTENT, REPLACE } from "@/lib/feedback";

const Body = z.object({
  intent: z.enum(INTENT),
  replace: z.enum(REPLACE),
  nps: z.number().int().min(0).max(10),
  comment: z.string().max(2000).optional(),
  name: z.string().max(60).optional(),
});

// Saves one parent's answers. Open to anyone with the link; a signed-in parent's answers are linked to their account.
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const parent = await getParent().catch(() => null);
  const { name, ...answers } = body.data;
  try {
    await saveFeedback(parent?.id ?? null, name?.trim() || null, { ...answers, comment: answers.comment?.trim() || undefined });
  } catch (err) {
    console.error("feedback not saved", err);
    return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
