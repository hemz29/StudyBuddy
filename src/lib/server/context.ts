import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { localStore } from "@/lib/store/local";
import { supabaseStore } from "@/lib/store/supabase";
import type { Child, Store } from "@/lib/store/types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Without Supabase settings the app runs in demo mode: one built-in parent, data in a local file.
export const isDemo = !URL || !ANON;
const DEMO_PARENT = { id: "00000000-0000-4000-8000-000000000001", email: "demo@studybuddy.local" };

export async function supabaseServer() {
  const jar = await cookies();
  return createServerClient(URL!, ANON!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead.
        }
      },
    },
  });
}

export async function getParent(): Promise<{ id: string; email: string } | null> {
  if (isDemo) return DEMO_PARENT;
  const { data } = await (await supabaseServer()).auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}

export async function requireParent() {
  const parent = await getParent();
  if (!parent) redirect("/login");
  return parent;
}

// Store acting as the signed-in parent (RLS applies).
export async function userStore(): Promise<Store> {
  return isDemo ? localStore : supabaseStore(await supabaseServer());
}

// Store for the phone upload page, which is authorised by a single-use token instead of a login.
export function serviceStore(): Store {
  if (isDemo) return localStore;
  return supabaseStore(createClient(URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } }));
}

const CHILD_COOKIE = "sb_child";

export async function getActiveChild(parentId: string): Promise<Child | null> {
  const id = (await cookies()).get(CHILD_COOKIE)?.value;
  if (!id) return null;
  return (await userStore()).getChild(parentId, id);
}

export async function requireChild() {
  const parent = await requireParent();
  const child = await getActiveChild(parent.id);
  if (!child) redirect("/profiles");
  return { parent, child };
}

export async function setActiveChild(childId: string) {
  (await cookies()).set(CHILD_COOKIE, childId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180 });
}
