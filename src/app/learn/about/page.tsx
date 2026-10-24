import Image from "next/image";
import Link from "next/link";
import { KnText } from "@/components/Word";
import { LineIcon, type IconName } from "@/components/LineIcon";

export const metadata = { title: "About us · Nudi" };

const EMAIL = "hemlata.v.29@gmail.com";

const STEPS: [IconName, string, string][] = [
  ["book", "Read and practise", "Lessons from the school syllabus, with the sound and meaning of every Kannada word one tap away."],
  ["pen", "Write by hand", "Worksheets and tests in the school's paper format, written on paper, just like the exam."],
  ["camera", "Get it marked", "A photo of the pages is read and marked against the teacher's answer key, with clear feedback."],
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
            <LineIcon name={icon} />
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

      </section>

      <section id="contact" className="card flex scroll-mt-6 flex-col gap-3 bg-white/90 p-6">
        <h2 className="text-xl">Contact us</h2>
        <p>We read every message. Write to us about:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Feedback: what helped, what was confusing, what you&apos;d like next</li>
          <li>A mark you think is wrong: tell us the worksheet and question number</li>
          <li>Deleting your account and all photos</li>
        </ul>
        <p className="select-all rounded-2xl bg-accent-soft px-5 py-4 text-xl font-semibold">{EMAIL}</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`mailto:${EMAIL}`} className="btn btn-primary">Write an email</a>
          <Link href="/learn/future" className="text-sm font-bold underline">Future plans</Link>
          <Link href="/privacy" className="text-sm font-bold underline">Privacy</Link>
        </div>
      </section>
    </div>
  );
}
