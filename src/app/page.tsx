import { redirect } from "next/navigation";
import { getActiveChild, getParent } from "@/lib/server/context";

export default async function Home() {
  const parent = await getParent();
  if (!parent) redirect("/login");
  const child = await getActiveChild(parent.id);
  redirect(child ? "/learn" : "/profiles");
}
