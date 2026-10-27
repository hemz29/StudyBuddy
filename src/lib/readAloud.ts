import { useSyncExternalStore } from "react";
import audio from "@/content/audio.json";
import { stats } from "@/lib/localStats";

// Read-aloud settings shared by every page: the voice and speed a learner picked, remembered in this browser.
export type Voice = "female" | "male";
export const VOICES = Object.keys(audio.voices) as Voice[];
// Reading speeds, stepped through with one button. Browsers keep the pitch when slowing down, so the voice stays natural.
export const SPEEDS = [1, 0.75, 0.5];

type Prefs = { voice: Voice; rate: number };
const KEY = "kk_read_aloud";
const DEFAULT: Prefs = { voice: VOICES[0] ?? "female", rate: 1 };
let prefs: Prefs = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Prefs> | null;
    if (p) prefs = { voice: VOICES.includes(p.voice as Voice) ? (p.voice as Voice) : DEFAULT.voice, rate: SPEEDS.includes(p.rate ?? 0) ? p.rate! : 1 };
  } catch {
    // No storage: use the defaults.
  }
}

export function setReadAloud(change: Partial<Prefs>) {
  prefs = { ...prefs, ...change };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Not remembered, but still used on this page.
  }
  listeners.forEach((l) => l());
}

export function useReadAloud() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => (load(), prefs),
    () => DEFAULT,
  );
}

// One sound at a time: anything that starts playing tells the others to stop, naming itself so it can ignore its own call.
export const STOP_EVENT = "kk-audio-stop";
export function stopOtherAudio(from: unknown) {
  window.dispatchEvent(new CustomEvent(STOP_EVENT, { detail: from }));
}
export function onStopAudio(me: unknown, stop: () => void) {
  const listener = (e: Event) => (e as CustomEvent).detail !== me && stop();
  window.addEventListener(STOP_EVENT, listener);
  return () => window.removeEventListener(STOP_EVENT, listener);
}

// Single words (made by scripts/tts-words.mjs). The list of words with audio loads the first time it's needed.
let wordList: Promise<Set<string>> | null = null;
export function wordsWithAudio() {
  wordList ??= fetch("/audio/words.json")
    .then((r) => (r.ok ? r.json() : []))
    .then((w: string[]) => new Set(w))
    .catch(() => new Set<string>());
  return wordList;
}

let player: HTMLAudioElement | null = null;
const WORD = "word";
if (typeof window !== "undefined") onStopAudio(WORD, () => player?.pause());

export function playWord(word: string) {
  stopOtherAudio(WORD);
  const { voice, rate } = (load(), prefs);
  player ??= new Audio();
  player.src = `/audio/${voice}/words/${encodeURIComponent(word)}.mp3`;
  player.preservesPitch = true;
  player.defaultPlaybackRate = player.playbackRate = rate;
  player.play().catch(() => {});
  stats.wordHeard();
}
