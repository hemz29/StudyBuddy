import { describe, expect, it } from "vitest";
import { boxInCrop, cropAround } from "@/lib/crop";

describe("word zoom", () => {
  it("adds a margin around the word and keeps the crop on the page", () => {
    const crop = cropAround({ left: 0.2, top: 0.655, right: 0.37, bottom: 0.685 });
    expect(crop.left).toBeCloseTo(0.14);
    expect(crop.width).toBeCloseTo(0.29);
    expect(crop.height).toBeCloseTo(0.08);
    expect(cropAround({ left: 0.01, top: 0.0, right: 0.1, bottom: 0.02 }).left).toBe(0);
  });

  it("places the word's outline inside the crop", () => {
    const box = { left: 0.2, top: 0.655, right: 0.37, bottom: 0.685 };
    const m = boxInCrop(box, cropAround(box));
    expect(m.left).toBeCloseTo((0.06 / 0.29) * 100);
    expect(m.width).toBeCloseTo((0.17 / 0.29) * 100);
    expect(m.top).toBeCloseTo((0.025 / 0.08) * 100);
  });
});
