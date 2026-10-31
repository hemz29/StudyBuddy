import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getParent, isDemo, setActiveChild, supabaseServer } from "@/lib/server/context";
import { isAdmin } from "@/lib/server/admin";
import { demoParent, resetDemo, signInAs, tagDemoGuest } from "@/lib/server/demo";
import { DEMO_COOKIE, DEMO_HOURS, makeTicket, readTicket } from "@/lib/demoCookie";
import { GUEST_SINCE_COOKIE } from "@/lib/guestPass";
import { SUPABASE_SERVICE_KEY } from "@/lib/supabaseEnv";

// Making the dummy families takes a little while.
export const maxDuration = 120;

// The admin's "Demo as" menu: be a fresh guest, be the demo parent, reset the demo data, or go back to yourself.
// Only an admin can start; while a demo runs, the signed ticket (lib/demoCookie) is what allows "Back to me".
export async function POST(req: Request) {
  const form = await req.formData();
  const action = String(form.get("do") ?? "");
  const back = String(form.get("back") ?? "/profiles");
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  const jar = await cookies();
  const parent = await getParent();
  const ticket = readTicket(jar.get(DEMO_COOKIE)?.value, SUPABASE_SERVICE_KEY);
  const admin = parent && !parent.isGuest && isAdmin(parent.email);
  if (!ticket && !admin) return go("/");

  try {
    if (action === "reset") {
      await resetDemo();
      // The demo parent's account is made afresh, so if that's who's signed in, sign in to the new one.
      if (!isDemo && parent && !admin && ticket) {
        const demo = await demoParent();
        if (parent.email.toLowerCase() === demo.email) {
          await signInAs(demo.email, await supabaseServer());
          if (demo.childId) await setActiveChild(demo.childId);
        }
      }
      return go(`${back}${back.includes("?") ? "&" : "?"}demo=reset`);
    }
    if (isDemo) return go(`${back}${back.includes("?") ? "&" : "?"}demo=local`); // switching accounts needs Supabase

    const supabase = await supabaseServer();
    if (action === "me") {
      if (!ticket) return go("/admin");
      await signInAs(ticket.email, supabase);
      jar.delete(DEMO_COOKIE);
      jar.delete("sb_child");
      jar.delete(GUEST_SINCE_COOKIE);
      return go("/admin");
    }

    // Starting a demo: the ticket remembers who to come back to, for 12 hours.
    if (!ticket && admin) jar.set(DEMO_COOKIE, makeTicket({ uid: parent!.id, email: parent!.email }, SUPABASE_SERVICE_KEY!), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: DEMO_HOURS * 3600 });

    if (action === "guest") {
      await supabase.auth.signOut();
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) throw new Error(error?.message ?? "guest sign-in failed");
      await tagDemoGuest(data.user.id);
      jar.delete("sb_child");
      jar.set(GUEST_SINCE_COOKIE, new Date().toISOString(), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return go("/profiles");
    }
    if (action === "parent") {
      const demo = await demoParent();
      await signInAs(demo.email, supabase);
      jar.delete(GUEST_SINCE_COOKIE);
      if (demo.childId) await setActiveChild(demo.childId);
      return go(demo.childId ? "/learn" : "/profiles");
    }
  } catch (err) {
    console.error("demo switch failed", err instanceof Error ? err.message : err);
    return go(`${back}${back.includes("?") ? "&" : "?"}demo=failed`);
  }
  return go(back);
}
