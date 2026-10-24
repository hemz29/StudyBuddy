import Image from "next/image";
import Link from "next/link";
import { KnText } from "@/components/Word";

export const metadata = { title: "About us · Nudi" };

const STEPS = [
  ["📖", "Read and practise", "Lessons from the school syllabus, with the sound and meaning of every Kannada word one tap away."],
  ["✍️", "Write by hand", "Worksheets and tests in the school's paper format, written on paper, just like the exam."],
  ["📷", "Get it marked", "A photo of the pages is read and marked against the teacher's answer key, with clear feedback."],
];

// What Nudi is and why it exists. A first draft for the owner to edit.
export default function About() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="card flex flex-col items-center gap-4 bg-white/90 p-8 text-center">
        <Image src="/brand/nudi-logo-print.png" alt="Nudi – Kannada, with confidence" width={600} height={458} className="w-44" />
        <h1 className="text-3xl">About Nudi</h1>
        <p className="max-w-xl text-lg">
          <KnText text="ನುಡಿ" /> (nudi) means language, or speech. Nudi helps Grade 6 children practise Kannada as a third language on their
          own, and helps parents feel sure their child is ready for the exam, even if they don&apos;t speak Kannada themselves.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(([icon, title, text]) => (
          <div key={title} className="card flex flex-col gap-2 bg-white/90 p-5">
            <span className="text-3xl" aria-hidden>{icon}</span>
            <h2 className="text-xl">{title}</h2>
            <p className="text-sm">{text}</p>
          </div>
        ))}
      </section>

      <section className="card flex flex-col gap-2 bg-white/90 p-6">
        <h2 className="text-xl">Who we are</h2>
        <p>
          Nudi is built by Hemlata, to give children Kannada practice they can do on their own and parents can trust. It is in a small
          pilot with invited families, and your feedback shapes what comes next.
        </p>
        <p className="mt-2 flex flex-wrap gap-4 text-sm">
          <Link href="/learn/contact" className="font-bold underline">Contact us</Link>
          <Link href="/learn/future" className="font-bold underline">Future forward</Link>
          <Link href="/privacy" className="font-bold underline">Privacy</Link>
        </p>
      </section>
    </div>
  );
}
