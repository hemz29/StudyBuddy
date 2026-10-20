// Text normalisation shared by answer-key matching.
const PUNCT = /[.,!?;:"'“”‘’()\[\]{}«»|।…\-–—_*]/g;

export function normalizeKn(s: string) {
  return s
    .normalize("NFC")
    .replace(/[​-‍﻿]/g, "")
    .replace(PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Spacing is not assessed, so key comparisons ignore it entirely.
export const compactKn = (s: string) => normalizeKn(s).replace(/\s/g, "");

export function normalizeEn(s: string) {
  return s
    .toLowerCase()
    .replace(PUNCT, " ")
    .replace(/\b(a|an|the|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Kannada aksharas (consonant clusters + vowel signs) as units, so edit distance counts letters a child writes.
export function graphemes(s: string): string[] {
  const seg = new Intl.Segmenter("kn", { granularity: "grapheme" });
  return [...seg.segment(s)].map((x) => x.segment);
}

export function editDistance(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
