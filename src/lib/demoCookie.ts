import { createHmac, timingSafeEqual } from "node:crypto";

// The "Demo as" switcher's ticket back to the admin who started the demo: who they are and until when, signed with a
// server-only secret so it can't be made up or changed in the browser. Without a valid ticket, "Back to me" does nothing.
export const DEMO_COOKIE = "kk_demo";
export const DEMO_HOURS = 12;
export type DemoTicket = { uid: string; email: string; exp: number };

const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function makeTicket(t: Omit<DemoTicket, "exp">, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ ...t, exp: now + DEMO_HOURS * 3600_000 })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function readTicket(value: string | undefined, secret: string | undefined, now = Date.now()): DemoTicket | null {
  if (!value || !secret) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;
  const want = Buffer.from(sign(payload, secret));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const t = JSON.parse(Buffer.from(payload, "base64url").toString()) as DemoTicket;
    return typeof t.uid === "string" && typeof t.email === "string" && t.exp > now ? t : null;
  } catch {
    return null;
  }
}
