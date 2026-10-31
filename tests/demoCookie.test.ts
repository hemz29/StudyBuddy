import { describe, expect, it } from "vitest";
import { DEMO_HOURS, makeTicket, readTicket } from "@/lib/demoCookie";

const SECRET = "server-secret";
const NOW = Date.parse("2026-11-01T10:00:00Z");

describe("demo switcher ticket", () => {
  it("reads back a ticket it made", () => {
    const t = readTicket(makeTicket({ uid: "u1", email: "owner@example.com" }, SECRET, NOW), SECRET, NOW + 1000);
    expect(t).toMatchObject({ uid: "u1", email: "owner@example.com" });
  });
  it("rejects tampering, the wrong secret, garbage and expired tickets", () => {
    const good = makeTicket({ uid: "u1", email: "owner@example.com" }, SECRET, NOW);
    const [payload, mac] = good.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "u2", email: "someone@else.com", exp: NOW + 9e9 })).toString("base64url");
    expect(readTicket(`${forged}.${mac}`, SECRET, NOW)).toBeNull();
    expect(readTicket(`${payload}.${mac}x`, SECRET, NOW)).toBeNull();
    expect(readTicket(good, "other-secret", NOW)).toBeNull();
    expect(readTicket("nonsense", SECRET, NOW)).toBeNull();
    expect(readTicket(undefined, SECRET, NOW)).toBeNull();
    expect(readTicket(good, undefined, NOW)).toBeNull();
    expect(readTicket(good, SECRET, NOW + DEMO_HOURS * 3600_000 + 1)).toBeNull();
  });
});
