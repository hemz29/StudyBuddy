import Link from "next/link";
import { signOut } from "@/lib/server/signOut";
import { LineIcon } from "@/components/LineIcon";

// Guests have no email to sign back in with, so they're asked to save first; signing out would lose their progress.
export function SignOutButton({ isGuest, className = "" }: { isGuest: boolean; className?: string }) {
  if (isGuest)
    return (
      <Link href="/save" className={className} title="Add your email first, so you can sign back in">
        <LineIcon name="lock" size={18} className="mr-1.5 inline align-[-3px]" />Save progress to sign out
      </Link>
    );
  return (
    <form action={signOut}>
      <button className={className}><LineIcon name="swap" size={18} className="mr-1.5 inline align-[-3px]" />Sign out</button>
    </form>
  );
}
