"use client";
import { useCallback, useEffect, useState } from "react";
import type { PageUpload, PracticeSession, QuestionAttempt } from "@/lib/store/types";
import { WorksheetMode } from "./WorksheetMode";
import { UploadPanel } from "./UploadPanel";
import { CheckingScreen } from "./CheckingScreen";
import { Results } from "./Results";

export type SessionState = { session: PracticeSession; pages: PageUpload[]; attempts: QuestionAttempt[] };

export function SessionView({ sessionId, worksheetId }: { sessionId: string; worksheetId: string }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`, { cache: "no-store" });
    if (!res.ok) return setError((await res.json()).error ?? "Couldn't load this practice.");
    setState(await res.json());
  }, [sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while photos are being read or the phone may send pages.
  const status = state?.session.status;
  useEffect(() => {
    if (!status || status === "graded" || status === "checking") return;
    if (status === "writing" && !uploading) return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [status, uploading, refresh]);

  if (error) return <p className="card p-6 text-bad">{error}</p>;
  if (!state) return <p className="card p-6">Loading…</p>;

  const { session } = state;
  if (session.status === "graded") return <Results state={state} worksheetId={worksheetId} />;
  if (session.status === "checking") return <CheckingScreen state={state} worksheetId={worksheetId} onDone={refresh} />;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <WorksheetMode session={session} worksheetId={worksheetId} />
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <UploadPanel state={state} onOpen={() => setUploading(true)} refresh={refresh} />
      </aside>
    </div>
  );
}
