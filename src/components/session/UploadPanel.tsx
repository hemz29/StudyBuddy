"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import type { SessionState } from "./SessionView";

const PAGE_STATUS: Record<string, string> = {
  received: "Received",
  reading: "Reading your handwriting…",
  read: "Read ✓",
  failed: "Couldn't read",
};

// Shrinks a photo in the browser before upload (keeps handwriting sharp, stays well under server limits).
export async function compressPage(file: File) {
  return imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2400, useWebWorker: true, fileType: "image/jpeg", initialQuality: 0.85 });
}

export function UploadPanel({ state, onOpen, refresh }: { state: SessionState; onOpen: () => void; refresh: () => void }) {
  const { session, pages } = state;
  const [qr, setQr] = useState<{ svg: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = qr !== null || pages.length > 0;

  async function showQr() {
    setError("");
    onOpen();
    const res = await fetch(`/api/sessions/${session.id}/token`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Couldn't make the QR code.");
    setQr({ svg: data.qrSvg, url: data.url });
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    onOpen();
    for (const f of Array.from(files)) {
      try {
        const small = await compressPage(f);
        const body = new FormData();
        body.append("page", small, "page.jpg");
        const res = await fetch(`/api/sessions/${session.id}/pages`, { method: "POST", body });
        if (!res.ok) setError((await res.json()).error ?? "Upload failed.");
      } catch {
        setError("That file isn't a photo we can read. Please choose a JPG or PNG photo.");
      }
    }
    setBusy(false);
    refresh();
  }

  const reading = pages.some((p) => p.status === "received" || p.status === "reading");

  return (
    <div className="card flex flex-col gap-4 p-5">
      <h2 className="text-xl font-extrabold">Finished writing?</h2>
      {!open ? (
        <>
          <p className="text-muted">Take a photo of each page with a phone. We&apos;ll read your handwriting and mark it.</p>
          <button onClick={showQr} className="btn btn-primary">📷 Send photos from a phone</button>
        </>
      ) : (
        <>
          {qr ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr.svg }} />
              <p className="font-bold">Scan with the phone camera</p>
              <p className="text-sm text-muted">The link works for 30 minutes. Photos appear here as soon as they arrive.</p>
            </div>
          ) : (
            <button onClick={showQr} className="btn btn-soft">Show QR code for a phone</button>
          )}
          {pages.length > 0 && (
            <ul className="flex flex-col gap-2">
              {pages.map((p, i) => (
                <li key={p.id} className={`rounded-xl px-3 py-2 text-sm ${p.status === "failed" ? "bg-bad-soft" : p.status === "read" ? "bg-good-soft" : "bg-accent-soft"}`}>
                  <span className="font-bold">Page {i + 1}:</span> {PAGE_STATUS[p.status]}
                  {p.status === "reading" && <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" />}
                  {p.error && <p className="mt-1">{p.error}</p>}
                </li>
              ))}
            </ul>
          )}
          {reading && <p className="text-sm text-muted">Reading takes about a minute per page. You can send more pages meanwhile.</p>}
        </>
      )}
      <label className="btn btn-ghost cursor-pointer">
        {busy ? "Uploading…" : "Upload photos from this computer"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={busy} onChange={(e) => uploadFiles(e.target.files)} />
      </label>
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
}
