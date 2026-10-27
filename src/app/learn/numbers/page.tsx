import { NUMBER_NAMES, toKannadaDigits } from "@/content/grade6/numbers";
import { KnText } from "@/components/Word";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata = { title: "Numbers · Kali Kannada" };

// Kannada numerals and number names 1–50, from the teacher's notes.
export default function Numbers() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Numbers" sub="Kannada numerals and number names, 1 to 50. Tap a name to see how it's said and what it means." />
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
