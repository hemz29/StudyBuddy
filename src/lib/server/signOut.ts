"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo, supabaseServer } from "./context";

// Signs the parent out and forgets which child was picked, back to the home page.
export async function signOut() {
  if (!isDemo) await (await supabaseServer()).auth.signOut();
  (await cookies()).delete("sb_child");
  redirect("/");
}
