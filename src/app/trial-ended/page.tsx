import Link from "next/link";
import { LogoMark } from "@/components/shell/Logo";
import { GUEST_DAYS } from "@/lib/guestPass";

export const metadata = { title: "Guest pass ended · Kali Kannada" };

export default function TrialEnded() {
  return (
    <main className="app-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="card flex w-full max-w-md flex-col gap-4 p-6 text-center sm:p-8">
        <span className="mx-auto"><LogoMark size={44} /></span>
        <h1 className="text-2xl">Your {GUEST_DAYS}-day guest pass has ended</h1>
        <p className="text-muted">Thanks for trying Kali Kannada! Create a free account to keep practising and see your child&apos;s progress on any device.</p>
        <Link href="/?mode=signup#signin" className="btn btn-primary">Sign up free</Link>
        <Link href="/?mode=signin#signin" className="text-sm text-muted underline">I already have an account: sign in</Link>
      </div>
    </main>
  );
}
