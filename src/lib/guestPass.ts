// The 7-day guest pass. A guest ("Start free") can use everything for 7 days; the middleware notes when it first
// sees a guest in this browser (so guests who started before the pass existed get their full 7 days from then).
export const GUEST_DAYS = 7;
export const GUEST_SINCE_COOKIE = "kk_guest_since";
const DAY = 864e5;

export function guestDaysLeft(since: string | undefined, now = Date.now()) {
  const start = since ? Date.parse(since) : NaN;
  if (Number.isNaN(start)) return GUEST_DAYS;
  return Math.max(0, Math.ceil((start + GUEST_DAYS * DAY - now) / DAY));
}

export function guestExpired(since: string | undefined, now = Date.now()) {
  const start = since ? Date.parse(since) : NaN;
  return !Number.isNaN(start) && now >= start + GUEST_DAYS * DAY;
}
