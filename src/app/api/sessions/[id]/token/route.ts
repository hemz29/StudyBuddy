import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { ownedSession } from "@/lib/server/api";

// Creates the short-lived link behind the QR code, so a phone can send photos for this practice without signing in.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await ownedSession((await params).id);
  if ("error" in r) return r.error;
  const token = randomBytes(18).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await r.store.createToken({ token, parentId: r.parent.id, childId: r.session.childId, sessionId: r.session.id, expiresAt });
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const url = `${origin}/snap/${token}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 1, width: 240 });
  return NextResponse.json({ url, qrSvg, expiresAt });
}
