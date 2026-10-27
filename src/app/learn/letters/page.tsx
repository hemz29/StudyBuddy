import { transliterate } from "@/lib/transliterate";
import { NUMBER_NAMES, toKannadaDigits } from "@/content/grade6/numbers";
import { KnText } from "@/components/Word";

// From the teacher's "Varnamale / Kagunita / Ottakshara / number names" notes.
const VOWELS = "ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ".split(" ");
const SHORT = "ಅ ಇ ಉ ಋ ಎ ಒ".split(" ");
// "Sounds like" hints for English speakers, shown under each vowel.
const SOUNDS_LIKE: Record<string, string> = {
  "ಅ": "u in 'up'", "ಆ": "a in 'father'", "ಇ": "i in 'sit'", "ಈ": "ee in 'see'", "ಉ": "u in 'put'", "ಊ": "oo in 'food'",
  "ಋ": "ru in 'rub'", "ಎ": "e in 'pet'", "ಏ": "'hey' without the h", "ಐ": "'eye'", "ಒ": "o in 'obey', short", "ಓ": "o in 'go'",
  "ಔ": "ow in 'cow'",
};
const VARGA: [string[], string][] = [
  ["ಕ ಖ ಗ ಘ ಙ".split(" "), "Kantya – from the throat"],
  ["ಚ ಛ ಜ ಝ ಞ".split(" "), "Taluvya – between the two jaws (palate)"],
  ["ಟ ಠ ಡ ಢ ಣ".split(" "), "Muurdhanya – tongue bent back to the roof of the mouth"],
  ["ತ ಥ ದ ಧ ನ".split(" "), "Dantya – tongue straight, touching the front teeth"],
  ["ಪ ಫ ಬ ಭ ಮ".split(" "), "Oshtya – with the lips"],
];
const AVARGA = "ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ ಳ".split(" ");
const SIGNS: [string, string, string][] = [
  ["ಅ", "", "Tale kattu"], ["ಆ", "ಾ", "Talekattina deergha"], ["ಇ", "ಿ", "Gudisu"], ["ಈ", "ೀ", "Gudisina deergha"],
  ["ಉ", "ು", "Kombu"], ["ಊ", "ೂ", "Kombina eli / deergha"], ["ಋ", "ೃ", "Vatrsuli"], ["ಎ", "ೆ", "Yetva"],
  ["ಏ", "ೇ", "Yetvada deergha"], ["ಐ", "ೈ", "Aitva"], ["ಒ", "ೊ", "Otva"], ["ಓ", "ೋ", "Otvada deergha"],
  ["ಔ", "ೌ", "Autva"], ["ಅಂ", "ಂ", "Ondu sonne"], ["ಅಃ", "ಃ", "Yeradu sonne"],
];
const OTTAKSHARA = "ಕ್ಕ ಖ್ಖ ಗ್ಗ ಘ್ಘ ಙ್ಙ ಚ್ಚ ಛ್ಛ ಜ್ಜ ಝ್ಝ ಞ್ಞ ಟ್ಟ ಠ್ಠ ಡ್ಡ ಢ್ಢ ಣ್ಣ ತ್ತ ಥ್ಥ ದ್ದ ಧ್ಧ ನ್ನ ಪ್ಪ ಫ್ಫ ಬ್ಬ ಭ್ಭ ಮ್ಮ ಯ್ಯ ರ್ರ ಲ್ಲ ವ್ವ ಶ್ಶ ಸ್ಸ ಹ್ಹ ಳ್ಳ".split(" ");

// Letters are shown as letters, with their sound underneath. They don't get word meanings: ಏ is also a word ("Hey!")
// and ಆ, ಈ mean "that", "these", which would be confusing next to the alphabet.
function Letter({ k, size = "text-3xl", like }: { k: string; size?: string; like?: string }) {
  return (
    <span className="flex flex-col items-center rounded-xl border border-gray-100 px-2 py-1.5">
      <span className={`kn ${size} font-bold`}>{k}</span>
      <span className="text-xs italic text-gray-500">{transliterate(k)}</span>
      {like && <span className="mt-0.5 max-w-24 text-center text-[11px] leading-tight text-muted">like {like}</span>}
    </span>
  );
}

export default function Letters() {
  return (
    <div className="flex flex-col gap-5">
      <section className="paper p-5">
        <h1 className="text-2xl font-extrabold"><KnText text="ಕನ್ನಡ ವರ್ಣಮಾಲೆ" /> · Kannada alphabet (49)</h1>
        <h2 className="mt-4 font-bold"><KnText text="ಸ್ವರಗಳು" /> · Vowels (13) <span className="font-normal text-gray-500">– said freely</span></h2>
        <div className="mt-2 flex flex-wrap gap-2">{VOWELS.map((v) => <Letter key={v} k={v} like={SOUNDS_LIKE[v]} />)}</div>
        <p className="mt-2 text-sm text-gray-600">
          Short (<KnText text="ಹ್ರಸ್ವ" />, said quickly): <span className="kn">{SHORT.join(" ")}</span> · Long (<KnText text="ದೀರ್ಘ" />, said longer): the other seven.
          Yogavaahagalu (2): <span className="kn">ಅಂ ಅಃ</span>
        </p>
      </section>

      <section className="paper p-5">
        <h2 className="font-bold"><KnText text="ವ್ಯಂಜನಗಳು" /> · Consonants (34) <span className="font-normal text-gray-500">– said with a vowel: <span className="kn">ಕ್ + ಅ = ಕ</span></span></h2>
        <p className="mt-1 text-sm text-gray-600">
          In each row: columns 1 and 3 are <b>alpapraana</b> (little breath), columns 2 and 4 are <b>mahaapraana</b> (more breath, e.g. <KnText text="ಭ" /> in <KnText text="ಭಾರತ" />), column 5 is <b>anunaasika</b> (through the nose).
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {VARGA.map(([row, label]) => (
            <div key={label} className="flex flex-wrap items-center gap-2">
              {row.map((c) => <Letter key={c} k={c} />)}
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {AVARGA.map((c) => <Letter key={c} k={c} />)}
            <span className="text-sm text-gray-600">Avargeeya – unstructured consonants</span>
          </div>
        </div>
      </section>

      <section className="paper p-5">
        <h2 className="font-bold"><KnText text="ಕಾಗುಣಿತ" /> · Kagunita (vowel signs)</h2>
        <p className="mt-1 text-sm text-gray-600">A consonant joined with a vowel sign. Example with <KnText text="ಕ" />:</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
          {SIGNS.map(([v, sign, name]) => {
            const k = v === "ಅ" ? "ಕ" : v === "ಅಂ" ? "ಕಂ" : v === "ಅಃ" ? "ಕಃ" : "ಕ" + sign;
            return (
              <div key={v} className="flex flex-col items-center rounded-xl border border-gray-100 p-2 text-center">
                <span className="kn text-3xl font-bold">{k}</span>
                <span className="text-xs italic text-gray-500">{transliterate(k)}</span>
                <span className="text-[0.7rem] text-gray-600">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="paper p-5">
        <h2 className="font-bold"><KnText text="ಒತ್ತಕ್ಷರಗಳು" /> · Ottakshara (double letters)</h2>
        <div className="mt-3 flex flex-wrap gap-2">{OTTAKSHARA.map((o) => <Letter key={o} k={o} size="text-2xl" />)}</div>
      </section>

      <section className="paper p-5">
        <h2 className="font-bold"><KnText text="ಸಂಖ್ಯಾಪದಗಳು" /> · Number names 1–50</h2>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(NUMBER_NAMES).map(([n, names]) => (
            <div key={n} className="flex items-baseline gap-2">
              <span className="kn w-10 text-right font-bold">{toKannadaDigits(n)}</span>
              <KnText text={names[0]} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
