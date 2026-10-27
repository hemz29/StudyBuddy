"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pageOf, setStatsChild, stats } from "@/lib/localStats";

const TICK = 15; // seconds
const IDLE = 60_000; // no tap, key or scroll for a minute: not counted as learning time

// Counts learning activity in this browser for the parent view: which parts are opened, and active time
// (only while the page is visible and the learner has done something in the last minute).
export function LocalTracker({ childId }: { childId: string }) {
  const path = usePathname();
  useEffect(() => setStatsChild(childId), [childId]);
  useEffect(() => {
    const page = pageOf(path);
    if (page) stats.page(page);
  }, [path]);
  useEffect(() => {
    let last = Date.now();
    const seen = () => (last = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "pointermove"] as const;
    events.forEach((e) => window.addEventListener(e, seen, { passive: true }));
    const t = setInterval(() => document.visibilityState === "visible" && Date.now() - last < IDLE && stats.time(TICK), TICK * 1000);
    return () => {
      clearInterval(t);
      events.forEach((e) => window.removeEventListener(e, seen));
    };
  }, []);
  return null;
}
