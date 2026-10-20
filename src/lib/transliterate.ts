// Kannada → English-letter pronunciation aid. One fixed scheme, generated in code:
// long vowels are doubled (aa, ee, oo) or marked (ē, ō); retroflex consonants are capitals (T, D, N, L, Sh).
const VOWELS: Record<string, string> = {
  "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ee", "ಉ": "u", "ಊ": "oo", "ಋ": "ru",
  "ಎ": "e", "ಏ": "ē", "ಐ": "ai", "ಒ": "o", "ಓ": "ō", "ಔ": "au",
};
const SIGNS: Record<string, string> = {
  "ಾ": "aa", "ಿ": "i", "ೀ": "ee", "ು": "u", "ೂ": "oo", "ೃ": "ru",
  "ೆ": "e", "ೇ": "ē", "ೈ": "ai", "ೊ": "o", "ೋ": "ō", "ೌ": "au",
};
const CONSONANTS: Record<string, string> = {
  "ಕ": "k", "ಖ": "kh", "ಗ": "g", "ಘ": "gh", "ಙ": "ng",
  "ಚ": "ch", "ಛ": "chh", "ಜ": "j", "ಝ": "jh", "ಞ": "ny",
  "ಟ": "T", "ಠ": "Th", "ಡ": "D", "ಢ": "Dh", "ಣ": "N",
  "ತ": "t", "ಥ": "th", "ದ": "d", "ಧ": "dh", "ನ": "n",
  "ಪ": "p", "ಫ": "ph", "ಬ": "b", "ಭ": "bh", "ಮ": "m",
  "ಯ": "y", "ರ": "r", "ಱ": "r", "ಲ": "l", "ವ": "v", "ಶ": "sh", "ಷ": "Sh", "ಸ": "s", "ಹ": "h", "ಳ": "L", "ೞ": "zh",
};
const DIGITS = "೦೧೨೩೪೫೬೭೮೯";
const VIRAMA = "್";
const ANUSVARA = "ಂ";
const VISARGA = "ಃ";
const LABIALS = new Set(["ಪ", "ಫ", "ಬ", "ಭ", "ಮ"]);

export function transliterate(text: string): string {
  const chars = [...text.normalize("NFC")];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];
    if (CONSONANTS[c]) {
      out += CONSONANTS[c];
      if (next === VIRAMA) i++;
      else if (next && SIGNS[next]) {
        out += SIGNS[next];
        i++;
      } else out += "a";
    } else if (VOWELS[c]) out += VOWELS[c];
    else if (c === ANUSVARA) out += next && LABIALS.has(next) ? "m" : "n";
    else if (c === VISARGA) out += "h";
    else if (DIGITS.includes(c)) out += DIGITS.indexOf(c);
    else if (c === "‌" || c === "‍") continue;
    else out += c;
  }
  return out;
}
