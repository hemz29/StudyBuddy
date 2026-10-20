import "server-only";
import { NextResponse } from "next/server";
import { getParent, userStore } from "./context";

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

// Loads a session the signed-in parent owns, or returns an error response.
export async function ownedSession(sessionId: string) {
  const parent = await getParent();
  if (!parent) return { error: fail(401, "Please sign in again.") } as const;
  const store = await userStore();
  const session = await store.getSession(parent.id, sessionId);
  if (!session) return { error: fail(404, "Practice not found.") } as const;
  return { parent, store, session } as const;
}

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageType = (typeof TYPES)[number];

// Validates one uploaded page image (the browser already compressed it).
export async function readImage(req: Request): Promise<{ data: Buffer; type: ImageType } | { error: NextResponse }> {
  const form = await req.formData().catch(() => null);
  const file = form?.get("page");
  if (!(file instanceof File)) return { error: fail(400, "No photo was sent.") };
  if (!TYPES.includes(file.type as ImageType)) return { error: fail(415, "Please send a photo (JPG, PNG or WEBP).") };
  if (file.size > MAX_BYTES) return { error: fail(413, "This photo is too large (over 10 MB).") };
  return { data: Buffer.from(await file.arrayBuffer()), type: file.type as ImageType };
}
