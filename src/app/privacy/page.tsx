import { Wordmark } from "@/components/shell/Logo";
import Link from "next/link";
import { KnText } from "@/components/Word";

export const metadata = { title: "Privacy · Kali Kannada" };

const CONTACT = "hemlata.v.29@gmail.com";

// Public privacy policy (no sign-in), linked from the sign-in page and from Google's sign-in screen.
// Keep it in step with what the app actually stores: see supabase/migrations and src/lib/store.
export default function Privacy() {
  return (
    <main className="min-h-screen bg-bg px-4 py-10">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/login" className="self-center">
          <Wordmark />
        </Link>
        <header>
          <h1 className="text-3xl">Privacy</h1>
          <p className="mt-1 text-muted">Last updated 23 October 2026</p>
        </header>

        <Section title="Who we are">
          <p>
            Kali Kannada (<KnText text="ಕಲಿ ಕನ್ನಡ" />) is a Kannada practice app for Grade 6 children, currently in a small pilot with invited families. It is run by
            Hemlata. Questions about your data: <a href={`mailto:${CONTACT}`} className="font-bold text-accent">{CONTACT}</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li><b>About you, the parent:</b> your email address. If you choose &ldquo;Start free&rdquo;, no email at all until you decide to save your progress. If you sign in with Google, also the name and profile photo on your Google account. Nothing else from Google: we never see your Gmail, Drive or contacts.</li>
            <li><b>About your child:</b> only a nickname and the avatar you pick. We don&apos;t ask for a full name, date of birth or school.</li>
            <li><b>Practice work:</b> photos of handwritten answers, the answers read from them, marks, which hints were used, and how long a worksheet took.</li>
            <li><b>Simple usage records:</b> which pages were opened, when, and on what kind of device (phone, tablet or computer), so we can see what helps and fix what doesn&apos;t.</li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>
            Only to read and mark your child&apos;s work, show you their progress, and improve Kali Kannada. There are no ads, and we never sell or share your
            data for marketing.
          </p>
        </Section>

        <Section title="Services that handle it for us">
          <ul>
            <li><b>Supabase:</b> sign-in and the database. Answer photos are kept in private storage that only your account can open.</li>
            <li><b>Vercel:</b> runs the website.</li>
            <li><b>Anthropic (Claude):</b> reads the handwriting in answer photos and marks sentence answers. Photos and answers are sent only for this.</li>
            <li><b>Google:</b> only if you choose &ldquo;Continue with Google&rdquo;, to sign you in.</li>
          </ul>
        </Section>

        <Section title="Children">
          <p>
            Only a parent can create an account. Children don&apos;t sign in, don&apos;t give an email address, and practise under the profile their parent
            set up.
          </p>
        </Section>

        <Section title="Keeping and deleting your data">
          <p>
            You can remove a child, with all their work, from the parent page at any time. To delete your whole account and every photo, email{" "}
            <a href={`mailto:${CONTACT}`} className="font-bold text-accent">{CONTACT}</a> and we&apos;ll delete it.
          </p>
        </Section>

        <Link href="/login" className="text-sm font-bold text-accent">← Back to sign in</Link>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card flex flex-col gap-2 p-5 leading-relaxed [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}
