import { describe, expect, it } from "vitest";
import { ALPHABET_TREE, countLetters } from "@/content/grade6/alphabet";

describe("alphabet tree", () => {
  it("holds all 49 letters: 13 vowels, 34 consonants, 2 yogavaahagalu", () => {
    expect(countLetters(ALPHABET_TREE)).toBe(49);
    expect(ALPHABET_TREE.children!.map(countLetters)).toEqual([13, 34, 2]);
  });
});
