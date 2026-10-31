import Link from "next/link";
import { cookies } from "next/headers";
import { guestSignIn, signOut } from "@/lib/server/signOut";
import { LineIcon } from "@/components/LineIcon";
import { GUEST_SINCE_COOKIE, guestDaysLeft } from "@/lib/guestPass";

// Signed-up parents get Sign out. Guests get their 7-day pass ("Guest · 5 days left · Save", going to /save) and a
// plain Sign in, for anyone who already has an account.
export async function SignOutButton({ isGuest, className = "" }: { isGuest: boolean; className?: string }) {
  if (isGuest) {
    const left = guestDaysLeft((await cookies()).get(GUEST_SINCE_COOKIE)?.value);
    return (
      <span className="flex items-center gap-1">
        <Link
          href="/save"
          title="Save your progress with an email or Google account"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${left <= 2 ? "bg-warn-soft text-warn" : "bg-accent-soft text-ink"}`}
        >
          <LineIcon name="lock" size={16} />
          Guest · {left} day{left === 1 ? "" : "s"} left · <span className="underline">Save</span>
        </Link>
        <form action={guestSignIn}>
          <button className={className}>Sign in</button>
        </form>
      </span>
    );
  }
  return (
    <form action={signOut}>
      <button className={className}><LineIcon name="swap" size={18} className="mr-1.5 inline align-[-3px]" />Sign out</button>
    </form>
  );
}
