"use client";
import { useEffect, useState } from "react";
import { compressPage } from "@/components/session/UploadPanel";
import { AvatarImage } from "@/components/AvatarImage";

type Info = { nickname: string; avatar: string; worksheet?: { kn: string; en: string }; graded: boolean };
type Shot = { file: File; url: string };

// Phone screen: one big action at a time, made for a 10–11-year-old.
export function SnapApp({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);

  useEffect(() => {
    fetch(`/api/snap/${token}`).then(async (r) => {
      const d = await r.json();
      if (r.ok) setInfo(d);
      else setError(d.error);
    });
  }, [token]);

  function add(files: FileList | null) {
    if (!files) return;
    setShots((s) => [...s, ...Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  async function send() {
    setSending(true);
    setError("");
    let ok = 0;
    for (const s of shots) {
      try {
        const small = await compressPage(s.file);
        const body = new FormData();
        body.append("page", small, "page.jpg");
        const res = await fetch(`/api/snap/${token}/pages`, { method: "POST", body });
        if (!res.ok) {
          setError((await res.json()).error ?? "Sending failed. Please try again.");
          break;
        }
        ok++;
      } catch {
        setError("That photo couldn't be sent. Please take it again.");
        break;
      }
    }
    setSent((n) => n + ok);
    setShots((s) => s.slice(ok));
    setSending(false);
  }

  if (error && !info) return <Shell><p className="text-center text-xl font-bold">{error}</p></Shell>;
  if (!info) return <Shell><p className="text-center">Loading…</p></Shell>;
  if (info.graded) return <Shell><p className="text-center text-xl font-bold">This worksheet is already marked. Look at the computer!</p></Shell>;

  return (
    <Shell>
      <div className="flex flex-col items-center text-center">
        <AvatarImage avatar={info.avatar} size={88} />
        <h1 className="mt-2 text-2xl font-extrabold">Hi {info.nickname}!</h1>
        <p className="opacity-80">{info.worksheet?.en}</p>
      </div>

      {sent > 0 && shots.length === 0 && !sending ? (
        <div className="card p-6 text-center">
          <p className="text-5xl">✅</p>
          <p className="mt-2 text-2xl font-extrabold">Sent!</p>
          <p className="mt-1 text-muted">{sent} page{sent > 1 ? "s" : ""} sent. Now look at the computer.</p>
          <label className="btn btn-ghost mt-5 w-full">
            Send another page
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => add(e.target.files)} />
          </label>
        </div>
      ) : (
        <>
          <p className="text-center font-bold">
            {shots.length === 0 ? "Take a photo of your first page. Lay it flat, in good light." : "Check your photos. Is the writing clear?"}
          </p>
          {shots.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {shots.map((s, i) => (
                <div key={s.url} className="card overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt={`Page ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="font-bold">Page {i + 1}</span>
                    <button onClick={() => setShots((x) => x.filter((_, j) => j !== i))} className="text-sm font-bold text-bad">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label className={`btn w-full cursor-pointer text-lg ${shots.length ? "btn-ghost" : "btn-primary h-16"}`}>
            📷 {shots.length ? "Take another page" : "Take photo"}
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => add(e.target.files)} />
          </label>
          <label className="btn btn-ghost w-full cursor-pointer">
            🖼 Choose from gallery
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => add(e.target.files)} />
          </label>
          {shots.length > 0 && (
            <button onClick={send} disabled={sending} className="btn btn-primary h-16 w-full text-lg">
              {sending ? "Sending…" : `Send ${shots.length} page${shots.length > 1 ? "s" : ""}`}
            </button>
          )}
        </>
      )}
      {error && <p className="rounded-xl bg-bad-soft p-3 text-center text-bad">{error}</p>}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen">
      <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-8">{children}</main>
    </div>
  );
}
