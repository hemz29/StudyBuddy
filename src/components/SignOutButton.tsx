import Link from "next/link";
import { signOut } from "@/lib/server/signOut";
import { LineIcon } from "@/components/LineIcon";

// Signed-up parents get Sign out. Guests never signed in with anything, so they get "Save progress" instead.
export function SignOutButton({ isGuest, className = "" }: { isGuest: boolean; className?: string }) {
  if (isGuest)
    return (
      <Link href="/save" className={className}>
        <LineIcon name="lock" size={18} className="mr-1.5 inline align-[-3px]" />Save progress
      </Link>
    );
  return (
    <form action={signOut}>
      <button className={className}><LineIcon name="swap" size={18} className="mr-1.5 inline align-[-3px]" />Sign out</button>
    </form>
  );
}
