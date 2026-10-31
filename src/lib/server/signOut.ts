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

// A guest leaving to sign in with an existing account: the same sign-out, then straight to the sign-in card.
// The guest's children can't be opened again afterwards (the save page says so and asks the parent to confirm).
export async function leaveGuest(formData: FormData) {
  if (!formData.get("understood")) redirect("/save#switch");
  if (!isDemo) await (await supabaseServer()).auth.signOut();
  (await cookies()).delete("sb_child");
  redirect("/#signin");
}
