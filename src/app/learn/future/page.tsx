import Link from "next/link";
import { LineIcon, type IconName } from "@/components/LineIcon";

export const metadata = { title: "Future plans · Nudi" };

const IDEAS: [IconName, string, string][] = [
  ["layers", "Every chapter, then more grades", "All Grade 6 chapters first, then Grades 5 to 8."],
  ["star", "Learning as a game", "Streaks, badges and friendly challenges that make daily practice something children look forward to."],
  ["translate", "Meanings in your language", "Word meanings and help in the language your family knows best, such as Telugu, Tamil or Hindi, not only English."],
  ["sound", "Listen and speak", "Hear every word and sentence read aloud, and practise saying them."],
  ["class", "Teacher view", "Teachers set worksheets and see how a class is doing."],
  ["phone", "Phone app", "Nudi on Android, with gentle practice reminders."],
  ["globe", "More languages", "The same way of learning for other Indian languages, not just Kannada."],
];

// The roadmap people keep asking about, kept high level and clearly not a promise.
export default function Future() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="card flex flex-col gap-2 bg-white/90 p-8">
        <h1 className="text-3xl">Future plans</h1>
        <p className="text-lg">Ideas we&apos;re working towards. They&apos;re plans, not promises, and the pilot families&apos; feedback decides what comes first.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {IDEAS.map(([icon, title, text]) => (
          <div key={title} className="card flex flex-col gap-2 bg-white/90 p-5">
            <LineIcon name={icon} />
            <h2 className="text-xl">{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <p className="text-center">
        What would help your child most? <Link href="/learn/about#contact" className="font-bold underline">Tell us what you&apos;d like next</Link>
      </p>
    </div>
  );
}
