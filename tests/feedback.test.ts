import { describe, expect, it } from "vitest";
import { nps } from "@/lib/feedback";

describe("NPS", () => {
  it("is promoters minus detractors", () => {
    expect(nps([10, 9, 8, 6])).toBe(25);
    expect(nps([])).toBeNull();
  });
});
