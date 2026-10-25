"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

// Disabled while sending, and for a short wait after a link was just sent (Supabase refuses repeat requests).
export function SendButton({ waitSeconds = 0 }: { waitSeconds?: number }) {
  const { pending } = useFormStatus();
  const [left, setLeft] = useState(waitSeconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    // Black, white and yellow, like the Kali Kannada logo ("Kannada, with confidence").
    <button disabled={pending || left > 0} className="btn btn-primary mt-2 w-full">
      {pending ? "Sending…" : left > 0 ? `You can ask again in ${left}s` : <span>Email me a sign-in <span className="text-[#fbce1a]">link</span></span>}
    </button>
  );
}
