"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo, supabaseServer } from "./context";
import { GUEST_SINCE_COOKIE } from "@/lib/guestPass";

// Signs the parent out and forgets which child was picked, back to the home page.
export async function signOut() {
  if (!isDemo) await (await supabaseServer()).auth.signOut();
  const jar = await cookies();
  jar.delete("sb_child");
  jar.delete(GUEST_SINCE_COOKIE);
  redirect("/");
}

// "Sign in" for a guest who already has an account: the guest session ends (the home page sends anyone signed in
// straight to practice), then the sign-in card opens, noting that guest practice doesn't come along.
export async function guestSignIn() {
  if (!isDemo) await (await supabaseServer()).auth.signOut();
  const jar = await cookies();
  jar.delete("sb_child");
  jar.delete(GUEST_SINCE_COOKIE);
  redirect("/?mode=signin&from=guest#signin");
}
