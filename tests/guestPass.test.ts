import { describe, expect, it } from "vitest";
import { GUEST_DAYS, guestDaysLeft, guestExpired } from "@/lib/guestPass";

const NOW = Date.parse("2026-11-10T12:00:00Z");
const ago = (days: number) => new Date(NOW - days * 864e5).toISOString();

describe("7-day guest pass", () => {
  it("counts whole days left and never goes below zero", () => {
    expect(guestDaysLeft(ago(0), NOW)).toBe(GUEST_DAYS);
    expect(guestDaysLeft(ago(0.5), NOW)).toBe(7);
    expect(guestDaysLeft(ago(5.2), NOW)).toBe(2);
    expect(guestDaysLeft(ago(6.9), NOW)).toBe(1);
    expect(guestDaysLeft(ago(9), NOW)).toBe(0);
  });
  it("expires exactly after 7 days, and treats a missing or broken start as fresh", () => {
    expect(guestExpired(ago(6.99), NOW)).toBe(false);
    expect(guestExpired(ago(7), NOW)).toBe(true);
    expect(guestExpired(undefined, NOW)).toBe(false);
    expect(guestExpired("not a date", NOW)).toBe(false);
    expect(guestDaysLeft(undefined, NOW)).toBe(GUEST_DAYS);
  });
});
