import Link from "next/link";

export const metadata = { title: "Contact us · Nudi" };

const EMAIL = "hemlata.v.29@gmail.com";

export default function Contact() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <section className="card flex flex-col gap-3 bg-white/90 p-8">
        <h1 className="text-3xl">Contact us</h1>
        <p className="text-lg">We read every message.</p>
        <p className="mt-2 select-all rounded-2xl bg-accent-soft px-5 py-4 text-xl font-semibold">{EMAIL}</p>
        <a href={`mailto:${EMAIL}`} className="btn btn-primary self-start">Write an email</a>
      </section>

      <section className="card flex flex-col gap-2 bg-white/90 p-6">
        <h2 className="text-xl">Good reasons to write</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Feedback: what helped, what was confusing, what you&apos;d like next</li>
          <li>A mark you think is wrong: tell us the worksheet and question number</li>
          <li>Deleting your account and all photos</li>
        </ul>
        <p className="mt-2 text-sm">
          How we handle your data: <Link href="/privacy" className="font-bold underline">Privacy</Link>
        </p>
      </section>
    </div>
  );
}
