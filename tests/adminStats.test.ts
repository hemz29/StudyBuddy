import { describe, expect, it } from "vitest";
import { funnel, repeatParents, visits, weekly } from "@/lib/adminStats";
import type { Child, PracticeSession } from "@/lib/store/types";

const ev = (parentId: string, createdAt: string) => ({ parentId, kind: "page_view", createdAt, device: "phone" });

describe("admin stats", () => {
  it("splits activity into visits at gaps over 30 minutes", () => {
    const v = visits([ev("a", "2026-10-20T10:00:00Z"), ev("a", "2026-10-20T10:20:00Z"), ev("a", "2026-10-20T11:30:00Z")], []);
    expect(v.map((x) => x.minutes)).toEqual([21, 1]);
  });

  it("counts parents seen on two different days", () => {
    const e = [ev("a", "2026-10-20T10:00:00Z"), ev("a", "2026-10-22T10:00:00Z"), ev("b", "2026-10-20T10:00:00Z"), ev("b", "2026-10-20T12:00:00Z")];
    expect(repeatParents(e, [])).toBe(1);
  });

  it("builds the sign-up funnel", () => {
    const children = [{ id: "c", parentId: "a", nickname: "H", theme: "x", createdAt: "2026-10-20T10:00:00Z" }] as Child[];
    const sessions = [{ parentId: "a", kind: "worksheet", status: "graded", startedAt: "2026-10-20T10:00:00Z" }] as PracticeSession[];
    const f = funnel([{ parentId: "a", joinedAt: null }, { parentId: "b", joinedAt: null }], children, sessions, 0);
    expect(f.map((x) => x.n)).toEqual([2, 1, 1, 1, 0]);
  });

  it("counts worksheets in the right week", () => {
    const sessions = [{ parentId: "a", kind: "worksheet", status: "writing", startedAt: "2026-10-21T10:00:00Z", completedAt: null }] as PracticeSession[];
    const rows = weekly([], [], sessions, [], 2, Date.parse("2026-10-24T10:00:00Z"));
    expect(rows.map((r) => r.started)).toEqual([0, 1]);
  });
});
