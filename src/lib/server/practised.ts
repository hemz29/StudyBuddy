import "server-only";
import { cookies } from "next/headers";

// Set once a child has finished a card set or started a worksheet, so the "Save progress" prompt waits until then.
export const PRACTISED_COOKIE = "kk_practised";

export async function notePractised() {
  try {
    (await cookies()).set(PRACTISED_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax" });
  } catch {
    // Not in a request that can set cookies: the prompt just waits a little longer.
  }
}
