import Link from "next/link";

export const metadata = { title: "Future forward · Nudi" };

const IDEAS = [
  ["📚", "Every chapter, then more grades", "All Grade 6 chapters first, then Grades 5 to 8."],
  ["🔊", "Listen and speak", "Hear every word and sentence read aloud, and practise saying them."],
  ["👩‍🏫", "Teacher view", "Teachers set worksheets and see how a class is doing."],
  ["📱", "Phone app", "Nudi on Android, with gentle practice reminders."],
];

// The roadmap people keep asking about, kept high level and clearly not a promise.
export default function Future() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="card flex flex-col gap-2 bg-white/90 p-8">
        <h1 className="text-3xl">Future forward</h1>
        <p className="text-lg">Ideas we&apos;re working towards. They&apos;re plans, not promises, and the pilot families&apos; feedback decides what comes first.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {IDEAS.map(([icon, title, text]) => (
          <div key={title} className="card flex flex-col gap-2 bg-white/90 p-5">
            <span className="text-3xl" aria-hidden>{icon}</span>
            <h2 className="text-xl">{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <p className="text-center">
        What would help your child most? <Link href="/learn/contact" className="font-bold underline">Tell us what you&apos;d like next</Link>
      </p>
    </div>
  );
}
