"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Notes each page opened, so the admin page can measure visits and time on the site.
export function ActivityPing() {
  const path = usePathname();
  useEffect(() => {
    fetch("/api/activity", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
