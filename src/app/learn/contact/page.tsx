import { redirect } from "next/navigation";

// Contact details now live on About us.
export default function Contact() {
  redirect("/learn/about#contact");
}
