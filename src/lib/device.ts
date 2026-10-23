// Rough device type from the browser's user-agent, for the pilot's usage records (no other details are kept).
// iPads on recent iOS present themselves as Macs, so they count as computers.
export type Device = "phone" | "tablet" | "computer";

export function deviceOf(userAgent: string | null | undefined): Device {
  const ua = userAgent ?? "";
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/iPhone|iPod|Android.*Mobile|Mobi/i.test(ua)) return "phone";
  return "computer";
}
