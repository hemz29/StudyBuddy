"use client";
import { useState } from "react";

// Shows the part of the page photo where an answer was written, so the child (or parent) compares the writing.
// The AI's line position is approximate, so the strip shows a line or so either side, and the whole page is a tap away.
export function HandwritingStrip({ sessionId, pageId, region }: { sessionId: string; pageId: string | null; region: { top: number; bottom: number } | null }) {
  const [ratio, setRatio] = useState<number | null>(null);
  const [whole, setWhole] = useState(false);
  if (!pageId || !region) return null;
  const pad = 0.05;
  const top = Math.max(0, region.top - pad);
  const span = Math.min(1, region.bottom + pad) - top;
  const src = `/api/images/${pageId}?session=${sessionId}`;
  return (
    <div className="flex flex-col gap-1">
      {whole ? (
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Your whole page" className="w-full" />
        </div>
      ) : (
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50" style={{ paddingTop: ratio ? `${span * ratio * 100}%` : "120px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Your handwriting"
            onLoad={(e) => setRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
            className="absolute left-0 w-full max-w-none"
            style={{ top: ratio ? `${-(top / span) * 100}%` : 0 }}
          />
        </div>
      )}
      <button type="button" onClick={() => setWhole(!whole)} className="self-start text-sm font-bold text-accent">
        {whole ? "Show just this answer" : "Can't find it? See the whole page"}
      </button>
    </div>
  );
}
