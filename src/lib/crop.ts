import type { PageBox } from "@/lib/store/types";

// The part of the page photo to show around a word: the word's box plus a margin (fractions of the page),
// kept inside the page. The AI's boxes can be a little off, so the margin is generous.
export function cropAround(box: PageBox, padX = 0.06, padY = 0.025) {
  const left = Math.max(0, box.left - padX);
  const top = Math.max(0, box.top - padY);
  const right = Math.min(1, box.right + padX);
  const bottom = Math.min(1, box.bottom + padY);
  return { left, top, width: right - left, height: bottom - top };
}

// Where a box sits inside a crop, as CSS percentages of the crop.
export function boxInCrop(box: PageBox, crop: { left: number; top: number; width: number; height: number }) {
  return {
    left: ((box.left - crop.left) / crop.width) * 100,
    top: ((box.top - crop.top) / crop.height) * 100,
    width: ((box.right - box.left) / crop.width) * 100,
    height: ((box.bottom - box.top) / crop.height) * 100,
  };
}
