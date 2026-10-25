"use server";
import { redirect } from "next/navigation";
import { isDemo, supabaseServer } from "./context";

// "Start free": a guest account with no email, so a family can use everything straight away. Adding an email or
// Google later (on /save) keeps the same account and all its progress.
export async function startFree() {
  if (isDemo) redirect("/profiles");
  const { error } = await (await supabaseServer()).auth.signInAnonymously();
  if (error) redirect(`/?error=${encodeURIComponent("Starting without an account isn't available right now. Please sign in with your email instead.")}#signin`);
  redirect("/profiles");
}
