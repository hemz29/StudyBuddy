import "server-only";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseEnv";

// Google buttons show only once Google is switched on in Supabase, so no parent meets a half-set-up sign-in.
export async function googleEnabled() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY! }, next: { revalidate: 60 } });
    return Boolean((await res.json()).external?.google);
  } catch {
    return false;
  }
}
