import type { Question } from "@/content/schema";
import { aksharas } from "@/content/words";
import { compactKn } from "@/lib/grading/normalize";

// Wrong choices for grammar drills that start like the question word, so the right answer can't be
// picked out just because it is the only choice that looks like the word.

const VOWEL_OF: Record<string, string> = {
  "ಾ": "ಆ", "ಿ": "ಇ", "ೀ": "ಈ", "ು": "ಉ", "ೂ": "ಊ", "ೃ": "ಋ",
  "ೆ": "ಎ", "ೇ": "ಏ", "ೈ": "ಐ", "ೊ": "ಒ", "ೋ": "ಓ", "ೌ": "ಔ",
};
const SIGN_OF = Object.fromEntries(Object.entries(VOWEL_OF).map(([s, v]) => [v, s]));

const isVowel = (a: string) => /^[ಅ-ಔ]/.test(a);
const consonantOf = (a: string) => (isVowel(a) ? "" : a.replace(/[ಾ-ೌಂಃ]+$/u, ""));
const vowelOf = (a: string) => (isVowel(a) ? a : (VOWEL_OF[a.match(/[ಾ-ೌ]/u)?.[0] ?? ""] ?? "ಅ"));
// The word without its final vowel sign, so a suffix can be added to the bare consonant.
const stem = (w: string) => w.replace(/[ಾ-ೌ]$/u, "");
const endsInVowel = (w: string) => /[ಾ-ೌಅ-ಔ]$/u.test(w);

// Join a prefix ending in virama to a word starting with a vowel: ಅನ್ + ಅರ್ಹ = ಅನರ್ಹ.
function prefixed(prefix: string, word: string) {
  const [first, ...rest] = aksharas(word);
  if (!first || !isVowel(first)) return prefix + word;
  if (!prefix.endsWith("್")) return null;
  return prefix.slice(0, -1) + (SIGN_OF[first] ?? "") + rest.join("");
}

function splits(word: string, correct: string) {
  const a = aksharas(word);
  const cut = aksharas(correct.split("+")[0].trim()).length;
  const out: { s: string; d: number; p: number }[] = [];
  for (let k = 1; k < a.length; k++) {
    const left = a.slice(0, k).join("");
    const g = a[k];
    const rest = a.slice(k + 1).join("");
    const c = consonantOf(g);
    const v = vowelOf(g);
    // Distance from the real cut: splitting inside akshara k makes a left part of k+1 aksharas.
    const inner = Math.abs(k + 1 - cut);
    const outer = Math.abs(k - cut);
    out.push({ s: `${left} + ${g}${rest}`, d: outer, p: 0 });
    if (c) out.push({ s: `${left}${c}ು + ${v}${rest}`, d: inner, p: 1 }, { s: `${left}${c} + ${v}${rest}`, d: inner, p: 2 });
    out.push({ s: `${left} + ${v}${rest}`, d: outer, p: 3 });
  }
  // Cuts near the real one are the most convincing.
  return out
    .filter((x) => aksharas(x.s.split(" + ")[1]).length > 1)
    .sort((x, y) => x.d - y.d || x.p - y.p)
    .map((x) => x.s);
}

const plurals = (w: string) =>
  (endsInVowel(w) ? ["ಗಳು", "ಯರು", "ಯಂದಿರು", "ಗಳ"] : ["ಗಳು", "ರು", "ಂದಿರು", "ಗಳ"]).map((s) => w + s);

const genders = (w: string) => ["ಿ", "ಿಣಿ", "ಳು", "ತಿ", "ಗಿತ್ತಿ", "ನಿ"].map((s) => stem(w) + s);

const opposites = (base: string) =>
  ["ಅ", "ಅನ್", "ಅಪ", "ನಿರ್", "ದುರ್", "ಅಪ್", "ಅವ", "ಅವ್", "ಸು"].map((p) => prefixed(p, base)).filter((x): x is string => !!x);

export function lookalikes(q: Question): string[] {
  const word = q.prompt.trim();
  const correct = q.answers[0];
  const [w1, w2] = aksharas(word);
  const [c1, c2] = aksharas(correct);
  // Regular forms keep the start of the word (ಕವಿ → ಕವಯಿತ್ರಿ); irregular ones don't (ಅಣ್ಣ → ಅಕ್ಕ).
  const sameStart = w1 === c1 && (!w2 || !c2 || consonantOf(w2) === consonantOf(c2));
  let candidates: string[] = [];
  if (q.type === "split") candidates = splits(word, correct);
  else if (q.type === "plural" && sameStart) candidates = plurals(word);
  else if (q.type === "gender" && sameStart) candidates = genders(word);
  else if (q.type === "opposite") {
    // Only where the answer is the word with a prefix added or removed (ಅರ್ಹ → ಅನರ್ಹ, ಅಸ್ಪಷ್ಟ → ಸ್ಪಷ್ಟ).
    const tail = aksharas(word).slice(1).join("");
    // The question word itself is a good wrong choice when the answer drops its prefix.
    if (compactKn(word).includes(compactKn(correct))) candidates = [word, ...opposites(correct)];
    else if (compactKn(correct).includes(compactKn(word)) || (isVowel(word) && tail && correct.endsWith(tail))) candidates = opposites(word);
  }
  const taken = new Set((q.type === "opposite" ? q.answers : [...q.answers, word]).map(compactKn));
  const seen = new Set<string>();
  return candidates.filter((c) => {
    const k = compactKn(c);
    if (taken.has(k) || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
