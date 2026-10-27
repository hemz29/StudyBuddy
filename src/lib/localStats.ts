// Learning activity counted in this browser, per child, so the parent view can show it even when progress isn't
// saved to an account. It lives only on this device: clearing browser data or a private window loses it.
// Every read and write is wrapped, because browser storage can be missing or blocked.

export type LocalStats = {
  v: 1;
  firstAt: string;
  lastAt: string;
  days: Record<string, number>; // seconds of active learning per local date (YYYY-MM-DD)
  pages: Record<string, number>; // times each part of the app was opened ("letters", "lesson:panchatantra", …)
  listened: Record<string, number>; // sentences played aloud, per lesson
  wordsHeard: number; // single words played aloud
  lookedUp: Record<string, number>; // words opened for their meaning, with how often
  cards: { lessonId: string; right: number; total: number; at: string }[]; // finished card sets, newest last
};

const MAX_WORDS = 300;
const MAX_CARDS = 30;
let child: string | null = null;

const keyFor = (id: string) => `kk_stats:${id}`;
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export function setStatsChild(id: string) {
  child = id;
}

export function readStats(id: string): LocalStats | null {
  try {
    const raw = localStorage.getItem(keyFor(id));
    return raw ? (JSON.parse(raw) as LocalStats) : null;
  } catch {
    return null;
  }
}

function update(change: (s: LocalStats) => void) {
  if (!child) return;
  try {
    const now = new Date().toISOString();
    const s: LocalStats = readStats(child) ?? { v: 1, firstAt: now, lastAt: now, days: {}, pages: {}, listened: {}, wordsHeard: 0, lookedUp: {}, cards: [] };
    change(s);
    s.lastAt = now;
    localStorage.setItem(keyFor(child), JSON.stringify(s));
  } catch {
    // Storage full or blocked: this browser just doesn't keep a tally.
  }
}

const bump = (m: Record<string, number>, k: string, by = 1) => (m[k] = (m[k] ?? 0) + by);

export const stats = {
  time: (seconds: number) => update((s) => bump(s.days, today(), seconds)),
  page: (page: string) => update((s) => bump(s.pages, page)),
  listened: (lessonId: string) => update((s) => bump(s.listened, lessonId)),
  wordHeard: () => update((s) => void (s.wordsHeard += 1)),
  lookedUp: (word: string) =>
    update((s) => {
      bump(s.lookedUp, word);
      const words = Object.keys(s.lookedUp);
      // Keep the most looked-up words if the list grows long.
      if (words.length > MAX_WORDS) for (const w of words.sort((a, b) => s.lookedUp[a] - s.lookedUp[b]).slice(0, words.length - MAX_WORDS)) delete s.lookedUp[w];
    }),
  cards: (lessonId: string, right: number, total: number) =>
    update((s) => void (s.cards = [...s.cards, { lessonId, right, total, at: new Date().toISOString() }].slice(-MAX_CARDS))),
};

// Which part of the app a /learn path is, for the "pages" tally.
export function pageOf(path: string): string | null {
  const m = path.match(/^\/learn\/([^/]+)(?:\/([^/]+))?/);
  if (!m) return null;
  const [, section, id] = m;
  if (section === "lesson" && id) return `lesson:${id}`;
  if (section === "cards" && id) return `cards:${id}`;
  return section;
}
