import Link from "next/link";
import { LineIcon, type IconName } from "@/components/LineIcon";

export const metadata = { title: "Future plans · Kali Kannada" };

const IDEAS: [IconName, string, string][] = [
  ["layers", "Every chapter, more grades", "All Grade 6 chapters first, then Grades 5 to 8."],
  ["star", "Learning as a game", "Streaks, badges and friendly challenges for daily practice."],
  ["translate", "Meanings in your language", "Help in Telugu, Tamil, Hindi and more, not only English."],
  ["sound", "Listen and speak", "Hear every word read aloud, and practise saying it."],
  ["class", "Teacher view", "Teachers set worksheets and follow a whole class."],
  ["phone", "Phone app", "Kali Kannada on Android, with gentle practice reminders."],
  ["globe", "More languages", "The same way of learning for other Indian languages."],
];

// The roadmap people keep asking about, kept high level and clearly not a promise.
export default function Future() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <header>
        <h1 className="text-2xl">Future plans</h1>
        <p className="text-sm text-muted">Plans, not promises. Pilot families&apos; feedback decides what comes first.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {IDEAS.map(([icon, title, text]) => (
          <div key={title} className="card flex items-start gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"><LineIcon name={icon} size={18} /></span>
            <div>
              <h2 className="text-base font-bold">{title}</h2>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <p className="text-sm">
        What would help your child most? <Link href="/learn/about#contact" className="font-bold underline">Tell us</Link>
      </p>
    </div>
  );
}
