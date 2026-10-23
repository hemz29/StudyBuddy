"use client";
import { useEffect, useState } from "react";

// Supabase reports sign-in failures after "#" in the address, which the server never sees; show them here.
export function HashError() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    if (!p.get("error")) return;
    const google = /external code|provider/i.test(p.get("error_description") ?? "");
    setMessage(google ? "Google sign-in didn't finish. Please try again, or use the email link below." : "Sign-in didn't finish. Please try again.");
  }, []);
  return message ? <p className="rounded-xl bg-bad-soft p-3 text-sm text-bad">{message}</p> : null;
}
