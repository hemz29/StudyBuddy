import { describe, expect, it } from "vitest";
import { nps } from "@/lib/feedback";

describe("NPS", () => {
  it("is promoters minus detractors", () => {
    expect(nps([10, 9, 8, 6])).toBe(25);
    expect(nps([])).toBeNull();
  });
});

describe("NPS breakdown", () => {
  it("splits replies into fans, neutral and unhappy, matching the NPS of 0 for 8, 5, 10, 8", async () => {
    const { nps, npsBreakdown } = await import("@/lib/feedback");
    expect(npsBreakdown([8, 5, 10, 8])).toEqual({ fans: 1, neutral: 2, unhappy: 1 });
    expect(nps([8, 5, 10, 8])).toBe(0);
    expect(npsBreakdown([])).toEqual({ fans: 0, neutral: 0, unhappy: 0 });
  });
});
