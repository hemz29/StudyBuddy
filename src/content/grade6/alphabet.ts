// The Kannada alphabet (ವರ್ಣಮಾಲೆ, 49 letters) as the tree in the school textbook (Svaraaksharagalu, Vyanjanaaksharagalu, Yogavaahagalu), and "sounds like" hints for vowels.

export const SOUNDS_LIKE: Record<string, string> = {
  "ಅ": "u in 'up'", "ಆ": "a in 'father'", "ಇ": "i in 'sit'", "ಈ": "ee in 'see'", "ಉ": "u in 'put'", "ಊ": "oo in 'food'",
  "ಋ": "ru in 'root'", "ಎ": "e in 'pet'", "ಏ": "'hey' without the h", "ಐ": "'eye'", "ಒ": "o in 'obey', short", "ಓ": "o in 'go'",
  "ಔ": "ow in 'cow'",
};

// `examples` are shown like letters but aren't counted among the 49 (ಪ್ಲುತ is a vowel held extra long, not a new letter).
export type TreeNode = { kn: string; en: string; note?: string; letters?: string[]; examples?: string[]; children?: TreeNode[] };

const L = (s: string) => s.split(" ");

export const ALPHABET_TREE: TreeNode = {
  kn: "ವರ್ಣಮಾಲೆ",
  en: "The alphabet",
  children: [
    {
      kn: "ಸ್ವರಾಕ್ಷರಗಳು",
      en: "Vowels",
      note: "Said on their own, freely",
      children: [
        { kn: "ಹ್ರಸ್ವ", en: "Short", note: "Said quickly", letters: L("ಅ ಇ ಉ ಋ ಎ ಒ") },
        { kn: "ದೀರ್ಘ", en: "Long", note: "Said longer", letters: L("ಆ ಈ ಊ ಏ ಐ ಓ ಔ") },
        { kn: "ಪ್ಲುತ", en: "Extra long", note: "A vowel held very long, as when calling someone. Not extra letters.", examples: ["ಅ ss", "ಇ ss", "ಉ ss"] },
      ],
    },
    {
      kn: "ವ್ಯಂಜನಾಕ್ಷರಗಳು",
      en: "Consonants",
      note: "Said with a vowel: ಕ್ + ಅ = ಕ",
      children: [
        {
          kn: "ವರ್ಗೀಯ",
          en: "Grouped",
          note: "Five groups of five",
          children: [
            { kn: "ಅಲ್ಪಪ್ರಾಣ", en: "Little breath", letters: L("ಕ ಗ ಚ ಜ ಟ ಡ ತ ದ ಪ ಬ") },
            { kn: "ಮಹಾಪ್ರಾಣ", en: "More breath", letters: L("ಖ ಘ ಛ ಝ ಠ ಢ ಥ ಧ ಫ ಭ") },
            { kn: "ಅನುನಾಸಿಕ", en: "Through the nose", letters: L("ಙ ಞ ಣ ನ ಮ") },
          ],
        },
        { kn: "ಅವರ್ಗೀಯ", en: "Ungrouped", note: "Not in a group", letters: L("ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ ಳ") },
      ],
    },
    {
      kn: "ಯೋಗವಾಹಗಳು",
      en: "Yogavaahagalu",
      note: "Need a vowel to be said",
      children: [
        { kn: "ಅನುಸ್ವಾರ", en: "Anusvaara", note: "An 'm' sound through the nose", letters: ["ಅಂ"] },
        { kn: "ವಿಸರ್ಗ", en: "Visarga", note: "A soft 'h' breath", letters: ["ಅಃ"] },
      ],
    },
  ],
};

export const countLetters = (n: TreeNode): number => (n.letters?.length ?? 0) + (n.children ?? []).reduce((t, c) => t + countLetters(c), 0);
