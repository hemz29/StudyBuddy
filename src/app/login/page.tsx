import { redirect } from "next/navigation";
import { isDemo } from "@/lib/server/context";

export const dynamic = "force-dynamic";

// Sign-in now lives on the home page; old links and messages (?error=, ?sent=) are passed on to it.
export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (isDemo) redirect("/profiles");
  const q = new URLSearchParams({ mode: "signup", ...(await searchParams) });
  redirect(`/?${q}#signin`);
}
