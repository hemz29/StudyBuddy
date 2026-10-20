"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartButton({ worksheetId, retryOf }: { worksheetId: string; retryOf: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    const res = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ worksheetId, retryOf }) });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    router.push(`/learn/session/${data.id}`);
  }

  return (
    <>
      <button onClick={start} disabled={busy} className="btn btn-primary">{busy ? "Starting…" : "I'm ready – start writing"}</button>
      {error && <p className="w-full text-bad">{error}</p>}
    </>
  );
}
