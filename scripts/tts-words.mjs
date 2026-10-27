// Tap-to-hear audio for single Kannada words, used on every learning page (the word popover's "Hear it").
// Finds every Kannada word in the app's source and content, speaks each once per voice with the same voices
// as the lessons (src/content/audio.json), and saves public/audio/<voice>/words/<word>.mp3.
// The list of words that have audio goes to public/audio/words.json, which the app loads when a word is first opened.
// Files that already exist are kept, not re-sent, so re-running after adding content only makes the new words.
// Usage: GOOGLE_TTS_API_KEY=... node scripts/tts-words.mjs
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.GOOGLE_TTS_API_KEY;
if (!KEY) throw new Error("Set GOOGLE_TTS_API_KEY first.");

// The same clean-up as stripPunct in src/content/words.ts, so file names match the words the app looks up.
const stripPunct = (w) => w.replace(/[“”"'‘’.,?!;:()[\]–—…\-।]/g, "").trim();
const KANNADA = /[ಀ-೿]/;
// A real word: only Kannada characters (and the joiners), starting with a letter rather than a vowel sign.
const WORD = /^[ಅ-ಹೞೠೡ][ಀ-೿\u200c\u200d]*$/;

async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else if (/\.(tsx?|json)$/.test(e.name) && e.name !== "audio.json") yield p;
  }
}
const words = new Set();
for await (const f of files("src"))
  for (const tok of (await readFile(f, "utf8")).split(/[\s`"'{}<>=,;()[\]]+/))
    if (KANNADA.test(tok)) {
      const w = stripPunct(tok);
      if (WORD.test(w)) words.add(w);
    }

const { voices } = JSON.parse(await readFile("src/content/audio.json", "utf8"));
const exists = (f) => access(f).then(() => true, () => false);
let chars = 0;
for (const gender of Object.keys(voices)) await mkdir(`public/audio/${gender}/words`, { recursive: true });
for (const w of [...words].sort()) {
  for (const [gender, name] of Object.entries(voices)) {
    const file = `public/audio/${gender}/words/${w}.mp3`;
    if (await exists(file)) continue;
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: { text: w }, voice: { languageCode: "kn-IN", name }, audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 } }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`${w}: ${res.status} ${json.error?.message}`);
    await writeFile(file, Buffer.from(json.audioContent, "base64"));
    chars += w.length;
  }
  process.stdout.write(".");
}
const have = [];
for (const w of [...words].sort()) if (await exists(`public/audio/${Object.keys(voices)[0]}/words/${w}.mp3`)) have.push(w);
await writeFile("public/audio/words.json", JSON.stringify(have) + "\n");
console.log(`\nDone: ${have.length} words with audio; ${chars} characters sent to Google this run.`);
