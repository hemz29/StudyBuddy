import type { Child, PracticeSession } from "@/lib/store/types";

// Numbers for the admin page's charts, worked out from what's already stored. Pure, so they can be tested.

type Event = { parentId: string; kind: string; createdAt: string; device: string | null; path?: string | null };
type Family = { parentId: string; joinedAt: string | null };

const MIN = 60_000;
const DAY = 864e5;
const GAP = 30 * MIN;
const IST = 5.5 * 60 * MIN;
const istDay = (iso: string) => new Date(Date.parse(iso) + IST).toISOString().slice(0, 10);

// Everything a parent or child did, as timestamps: page views, other events and worksheet milestones.
function timestamps(events: Event[], sessions: PracticeSession[]) {
  const by = new Map<string, number[]>();
  const add = (p: string, iso?: string | null) => {
    if (!iso) return;
    if (!by.has(p)) by.set(p, []);
    by.get(p)!.push(Date.parse(iso));
  };
  events.forEach((e) => add(e.parentId, e.createdAt));
  sessions.forEach((s) => [s.startedAt, s.writingDoneAt, s.completedAt].forEach((t) => add(s.parentId, t)));
  by.forEach((t) => t.sort((a, b) => a - b));
  return by;
}

export type Visit = { parentId: string; start: number; minutes: number };

// A visit is a run of activity with no gap over 30 minutes. Its length is first to last event, plus a minute.
export function visits(events: Event[], sessions: PracticeSession[]): Visit[] {
  const out: Visit[] = [];
  timestamps(events, sessions).forEach((times, parentId) => {
    let start = times[0];
    let last = times[0];
    for (const t of times.slice(1).concat(Infinity)) {
      if (t - last > GAP) {
        out.push({ parentId, start, minutes: Math.round((last - start) / MIN) + 1 });
        start = t;
      }
      last = t;
    }
  });
  return out;
}

// Parents seen on two or more different days (India time).
export function repeatParents(events: Event[], sessions: PracticeSession[]) {
  let n = 0;
  timestamps(events, sessions).forEach((times) => {
    if (new Set(times.map((t) => istDay(new Date(t).toISOString()))).size > 1) n++;
  });
  return n;
}

export function funnel(families: Family[], children: Child[], sessions: PracticeSession[], repeat: number) {
  const has = (f: (p: string) => boolean) => families.filter((x) => f(x.parentId)).length;
  const ws = sessions.filter((s) => s.kind === "worksheet");
  return [
    { step: "Signed up", n: families.length },
    { step: "Added a child", n: has((p) => children.some((c) => c.parentId === p)) },
    { step: "Started a worksheet", n: has((p) => ws.some((s) => s.parentId === p)) },
    { step: "Finished one", n: has((p) => ws.some((s) => s.parentId === p && s.status === "graded")) },
    { step: "Came back another day", n: repeat },
  ];
}

// Monday of the week, as "12 Oct".
function weekOf(t: number) {
  const d = new Date(t + IST);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.getTime();
}
const label = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function weekly(families: Family[], children: Child[], sessions: PracticeSession[], vs: Visit[], weeks = 12, now = Date.now()) {
  const first = weekOf(now) - (weeks - 1) * 7 * DAY;
  const rows = Array.from({ length: weeks }, (_, i) => ({ t: first + i * 7 * DAY, week: label(first + i * 7 * DAY), parents: 0, children: 0, active: 0, started: 0, finished: 0 }));
  const row = (iso: string | number) => rows.find((r) => r.t === weekOf(typeof iso === "number" ? iso : Date.parse(iso)));
  rows.forEach((r) => {
    const end = r.t + 7 * DAY - IST;
    r.parents = families.filter((f) => f.joinedAt && Date.parse(f.joinedAt) < end).length;
    r.children = children.filter((c) => Date.parse(c.createdAt) < end).length;
  });
  const active = new Map<number, Set<string>>();
  vs.forEach((v) => {
    const r = row(v.start);
    if (!r) return;
    if (!active.has(r.t)) active.set(r.t, new Set());
    active.get(r.t)!.add(v.parentId);
  });
  rows.forEach((r) => (r.active = active.get(r.t)?.size ?? 0));
  sessions.filter((s) => s.kind === "worksheet").forEach((s) => {
    const a = row(s.startedAt);
    if (a) a.started++;
    const b = s.status === "graded" && s.completedAt ? row(s.completedAt) : null;
    if (b) b.finished++;
  });
  return rows;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// When families use the app, by weekday and by hour of the day (India time).
export function busyTimes(vs: Visit[]) {
  const days = DAYS.map((day) => ({ day, visits: 0 }));
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}`, visits: 0 }));
  vs.forEach((v) => {
    const d = new Date(v.start + IST);
    days[(d.getUTCDay() + 6) % 7].visits++;
    hours[d.getUTCHours()].visits++;
  });
  return { days, hours };
}

export function devices(events: Event[]) {
  const known = events.filter((e) => e.device);
  return ["phone", "tablet", "computer"].map((d) => ({ device: d[0].toUpperCase() + d.slice(1), n: known.filter((e) => e.device === d).length }));
}

// What children spend time on, from the pages they open and the practice they finish.
export function activityMix(events: Event[], sessions: PracticeSession[]) {
  const views = (re: RegExp) => events.filter((e) => e.kind === "page_view" && re.test(e.path ?? "")).length;
  return [
    { what: "Lessons", n: events.filter((e) => e.kind === "lesson_view").length || views(/^\/learn\/lesson\//) },
    { what: "Grammar cards", n: sessions.filter((s) => s.kind === "cards").length },
    { what: "Letters", n: views(/^\/learn\/letters/) },
    { what: "Worksheets & tests", n: sessions.filter((s) => s.kind === "worksheet").length },
    { what: "My scores", n: views(/^\/learn\/scores/) },
    { what: "Parent dashboard", n: events.filter((e) => e.kind === "parent_dashboard").length },
  ];
}

export const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
