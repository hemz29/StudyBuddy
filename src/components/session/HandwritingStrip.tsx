"use client";
import { useState } from "react";
import type { PageBox } from "@/lib/store/types";
import { boxInCrop, cropAround } from "@/lib/crop";

type Crop = { left: number; top: number; width: number; height: number };
const src = (sessionId: string, pageId: string) => `/api/images/${pageId}?session=${sessionId}`;

// One part of the page photo, scaled to the box's width, with an optional yellow outline around a word.
function PhotoCrop({ url, crop, mark, maxHeight, alt }: { url: string; crop: Crop; mark?: PageBox; maxHeight: number; alt: string }) {
  const [ratio, setRatio] = useState<number | null>(null); // page height / width
  const aspect = ratio ? crop.width / (crop.height * ratio) : 4; // crop width / height on screen
  const m = mark && boxInCrop(mark, crop);
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50" style={{ width: `min(100%, ${Math.round(maxHeight * aspect)}px)`, aspectRatio: String(aspect) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onLoad={(e) => setRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
        className="absolute max-w-none"
        style={{ width: `${100 / crop.width}%`, left: `${(-crop.left / crop.width) * 100}%`, top: `${(-crop.top / crop.height) * 100}%` }}
      />
      {m && ratio && (
        <span className="pointer-events-none absolute rounded-md ring-4 ring-yellow-400/90" style={{ left: `${m.left}%`, top: `${m.top}%`, width: `${m.width}%`, height: `${m.height}%` }} />
      )}
    </div>
  );
}

// The answer's part of the page photo, so the child (or parent) compares the writing. With `mark`, the unsure word is
// outlined. The AI's positions are approximate, so the strip shows a line or so either side, and the whole page is a tap away.
export function HandwritingStrip({ sessionId, pageId, region, mark }: { sessionId: string; pageId: string | null; region: { top: number; bottom: number } | null; mark?: PageBox }) {
  const [whole, setWhole] = useState(false);
  if (!pageId || !region) return null;
  const pad = 0.05;
  const top = Math.max(0, region.top - pad);
  const crop = { left: 0, top, width: 1, height: Math.min(1, region.bottom + pad) - top };
  return (
    <div className="flex flex-col gap-1">
      {whole ? (
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src(sessionId, pageId)} alt="Your whole page" className="w-full" />
        </div>
      ) : (
        <PhotoCrop url={src(sessionId, pageId)} crop={crop} mark={mark} maxHeight={400} alt="Your handwriting" />
      )}
      <button type="button" onClick={() => setWhole(!whole)} className="self-start text-sm font-bold text-accent">
        {whole ? "Show just this answer" : "Can't find it? See the whole page"}
      </button>
    </div>
  );
}

// A close-up of one handwritten word, outlined in yellow like the word in "What we read".
export function WordZoom({ sessionId, pageId, box }: { sessionId: string; pageId: string | null; box: PageBox }) {
  if (!pageId) return null;
  return <PhotoCrop url={src(sessionId, pageId)} crop={cropAround(box)} mark={box} maxHeight={170} alt="The word you wrote" />;
}
