"use client";
import { signOut } from "@/lib/server/signOut";
import { LineIcon } from "@/components/LineIcon";

// Anyone can sign out. Guests have no email to sign back in with, so they're warned first that their progress will be lost.
export function SignOutButton({ isGuest, className = "" }: { isGuest: boolean; className?: string }) {
  return (
    <form
      action={signOut}
      onSubmit={(e) => {
        if (isGuest && !confirm("You haven't saved your progress with an email or Google, so you won't be able to come back to it. Sign out anyway?")) e.preventDefault();
      }}
    >
      <button className={className}><LineIcon name="swap" size={18} className="mr-1.5 inline align-[-3px]" />Sign out</button>
    </form>
  );
}
