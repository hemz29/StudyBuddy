import Image from "next/image";
import { LogoMark } from "@/components/shell/Logo";
import Link from "next/link";
import { KnText } from "@/components/Word";
import { LineIcon, type IconName } from "@/components/LineIcon";

export const metadata = { title: "About us · Kali Kannada" };

const EMAIL = "hemlata.v.29@gmail.com";

const STEPS: [IconName, string, string][] = [
  ["book", "Read and practise", "Syllabus lessons, every word's sound and meaning a tap away."],
  ["pen", "Write by hand", "Worksheets in the school's paper format, written on paper."],
  ["camera", "Get it marked", "A photo is marked against the teacher's key, with clear feedback."],
];

// What Kali Kannada is and why it exists. A first draft for the owner to edit.
export default function About() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <section className="card flex items-center gap-4 p-4 sm:p-5">
        <LogoMark size={64} />
        <div>
          <h1 className="text-2xl">About Kali Kannada</h1>
          <p className="text-sm text-muted">
            <KnText text="ಕಲಿ ಕನ್ನಡ" /> (kali Kannada) means &ldquo;learn Kannada&rdquo;. Grade 6 children practise Kannada on their own, and parents can see
            they&apos;re ready for the exam, even without speaking Kannada themselves.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {STEPS.map(([icon, title, text], i) => (
          <div key={title} className="card flex items-start gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"><LineIcon name={icon} size={18} /></span>
            <div>
              <h2 className="text-base font-bold">{i + 1}. {title}</h2>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card flex flex-col gap-3 p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <Image src="/brand/founder-portrait.webp" alt="Hema, who built Kali Kannada" width={450} height={600} className="h-24 w-18 shrink-0 rounded-xl object-cover" />
          <div>
            <h2 className="text-2xl">Why I built Kali Kannada</h2>
            <p className="text-sm text-muted">Hema, a parent who built Kali Kannada</p>
          </div>
        </div>
        <div className="flex max-w-3xl flex-col gap-3 text-justify leading-relaxed [hyphens:auto]">
          <p>I&apos;m a working mum of two wonderful kids. Like many parents across Karnataka, I&apos;ve seen how essential Kannada becomes as part of their school journey.</p>
          <p>But here&apos;s the truth: I don&apos;t know Kannada well enough to confidently guide them myself.</p>
          <p>Before every test or exam, I&apos;d spend 2–3 hours creating practice worksheets: researching, typing, formatting, hoping they covered what really mattered. I&apos;d even share them with other parents on our class WhatsApp group. Still, one question always lingered:</p>
          <p className="border-l-2 border-ink pl-4 font-medium">Am I teaching this right? Are my kids really learning what they need?</p>
          <p>Private tutors helped, but group classes rarely matched each child&apos;s unique learning pace. So I tried using general AI tools. They worked, up to a point. But copying text, translating, formatting quizzes… it was messy. And even after all that effort, I was never fully sure the content was accurate or culturally right.</p>
          <p className="font-medium">That&apos;s when I decided to build Kali Kannada.</p>
          <p>Kali Kannada brings every scattered step together, helping children read, understand, and practise Kannada with confidence, while saving parents hours of prep time.</p>
          <p>And because language is more than grammar (it&apos;s culture and emotion), a real Kannada educator helps review Kali Kannada&apos;s AI-generated content, refining it to feel human, natural, and trustworthy.</p>
          <p>Kali Kannada wasn&apos;t born because the world needed another learning app. It was born because parents like me needed something that truly worked.</p>
          <p className="text-lg"><KnText text="ಕಲಿ ಕನ್ನಡ" /> | Kali Kannada<br /><span className="text-muted">Kannada, with confidence.</span></p>
        </div>
      </section>

      <div className="grid gap-3">
        <section id="contact" className="card flex scroll-mt-6 flex-col gap-2 p-4 sm:p-5">
          <h2 className="text-base font-bold">Contact us</h2>
          <p className="text-sm text-muted">Feedback, a mark you think is wrong (worksheet and question number), or deleting your account.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${EMAIL}`} className="btn btn-primary">Email us</a>
            <span className="select-all text-sm font-semibold">{EMAIL}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/feedback" className="font-bold underline">Give feedback</Link>
            <Link href="/learn/future" className="font-bold underline">Future plans</Link>
            <Link href="/privacy" className="font-bold underline">Privacy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
