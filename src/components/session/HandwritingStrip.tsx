"use client";
import { useState } from "react";

// Shows the part of the page photo where an answer was written, so the child compares their own writing.
export function HandwritingStrip({ sessionId, pageId, region }: { sessionId: string; pageId: string | null; region: { top: number; bottom: number } | null }) {
  const [ratio, setRatio] = useState<number | null>(null);
  if (!pageId || !region) return null;
  const pad = 0.012;
  const top = Math.max(0, region.top - pad);
  const span = Math.min(1, region.bottom + pad) - top;
  const src = `/api/images/${pageId}?session=${sessionId}`;
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50" style={{ paddingTop: ratio ? `${span * ratio * 100}%` : "64px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Your handwriting"
        onLoad={(e) => setRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
        className="absolute left-0 w-full max-w-none"
        style={{ top: ratio ? `${-(top / span) * 100}%` : 0 }}
      />
    </div>
  );
}
