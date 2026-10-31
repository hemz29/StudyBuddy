"use client";
import Script from "next/script";
import { useRef } from "react";

type Google = { accounts: { id: { initialize: (o: object) => void; prompt: () => void } } };

// "Continue as …" from Google, for a visitor whose browser is already signed in to Google, so a returning parent
// lands in their own account instead of starting as a guest by mistake. Only shown when a client ID is configured.
export function GoogleOneTap({ clientId }: { clientId: string }) {
  const nonce = useRef("");
  async function start() {
    const google = (window as unknown as { google?: Google }).google;
    if (!google) return;
    // Google gets a hash of a one-time code; Supabase gets the code itself and checks they match.
    nonce.current = crypto.randomUUID();
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce.current));
    const hashed = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
    google.accounts.id.initialize({
      client_id: clientId,
      nonce: hashed,
      use_fedcm_for_prompt: true,
      cancel_on_tap_outside: true,
      callback: async ({ credential }: { credential: string }) => {
        const res = await fetch("/api/auth/one-tap", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential, nonce: nonce.current }) });
        if (res.ok) window.location.href = "/profiles";
      },
    });
    google.accounts.id.prompt();
  }
  return <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={start} />;
}
