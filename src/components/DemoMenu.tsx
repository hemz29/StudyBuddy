import { Suspense } from "react";
import { cookies } from "next/headers";
import { getParent } from "@/lib/server/context";
import { isAdmin } from "@/lib/server/admin";
import { DEMO_COOKIE, readTicket } from "@/lib/demoCookie";
import { DEMO_PARENT_EMAIL } from "@/lib/demoData";
import { SUPABASE_SERVICE_KEY } from "@/lib/supabaseEnv";
import { DemoMenuPanel } from "./DemoMenuPanel";

// "Demo as ▾" for the admin, in the header of the learner pages, Parent view, profiles and the admin page.
// While a demo runs it shows which role this tab is in ("Demo · Guest") so there's never any doubt.
export async function DemoMenu({ back }: { back: string }) {
  const parent = await getParent();
  const ticket = readTicket((await cookies()).get(DEMO_COOKIE)?.value, SUPABASE_SERVICE_KEY);
  const admin = Boolean(parent && !parent.isGuest && isAdmin(parent.email));
  if (!ticket && !admin) return null;
  const role = !parent ? "Signed out" : parent.isGuest ? "Guest" : parent.email.toLowerCase() === DEMO_PARENT_EMAIL ? "Demo parent" : "Admin (you)";
  // The panel reads ?demo= for its notes, which needs a Suspense boundary.
  return (
    <Suspense>
      <DemoMenuPanel role={role} running={Boolean(ticket)} back={back} />
    </Suspense>
  );
}
