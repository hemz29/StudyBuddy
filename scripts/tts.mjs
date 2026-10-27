// Read-aloud audio: turns lesson sentences into Kannada speech with Google Cloud Text-to-Speech (kn-IN voices),
// saved once as MP3s in public/audio/, so families never call Google and the key never leaves this machine.
// Usage: GOOGLE_TTS_API_KEY=... node scripts/tts.mjs <lessonId> [blockNumber ...]
//   e.g. node scripts/tts.mjs panchatantra 1     (block 1 = the first part after the introduction; 0 = introduction)
// Writes public/audio/<voice>/<lessonId>/<sentenceId>.mp3, plus <sentenceId>-w<n>.mp3 read from word n onwards
// (tap a word to read from there), and updates src/content/audio.json. Files that already exist are kept, not re-sent.
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const KEY = process.env.GOOGLE_TTS_API_KEY;
if (!KEY) throw new Error("Set GOOGLE_TTS_API_KEY first.");
const [lessonId, ...blockArgs] = process.argv.slice(2);
if (!lessonId) throw new Error("Usage: node scripts/tts.mjs <lessonId> [blockNumber ...]");

const API = "https://texttospeech.googleapis.com/v1";
const call = async (path, body) => {
  const res = await fetch(`${API}/${path}${path.includes("?") ? "&" : "?"}key=${KEY}`, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {});
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${json.error?.message ?? JSON.stringify(json)}`);
  return json;
};

// The most natural Kannada voice Google has for each gender: Chirp 3 HD, then WaveNet, then Standard.
const { voices } = await call("voices?languageCode=kn-IN");
const rank = (n) => (n.includes("Chirp3-HD") ? 0 : n.includes("Chirp") ? 1 : n.includes("Wavenet") ? 2 : n.includes("Neural2") ? 2 : 3);
const pick = (g) => voices.filter((v) => v.ssmlGender === g).sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))[0];
const chosen = [["female", pick("FEMALE")], ["male", pick("MALE")]].filter(([, v]) => v);
console.log("Kannada voices available:", voices.map((v) => `${v.name} (${v.ssmlGender})`).join(", "));
console.log("Using:", chosen.map(([g, v]) => `${g} = ${v.name}`).join(", "));

// Lesson sentences, read from the app's own content through a tiny TypeScript runner.
const lesson = JSON.parse(execFileSync("npx", ["tsx", "-e", `import { getLesson } from "./src/content"; console.log(JSON.stringify(getLesson(${JSON.stringify(lessonId)})))`], { encoding: "utf8" }));
if (!lesson) throw new Error(`No lesson called ${lessonId}`);
const blocks = [...(lesson.intro.length ? [{ sentences: lesson.intro }] : [{ sentences: [] }]), ...lesson.parts];
const wanted = blockArgs.length ? blockArgs.map(Number) : blocks.map((_, i) => i);

const manifestPath = "src/content/audio.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => '{"voices":{},"sentences":[]}'));
const done = new Set(manifest.sentences);
const fromWord = new Set(manifest.fromWord ?? []);
const exists = (f) => access(f).then(() => true, () => false);
let chars = 0;
for (const [gender, voice] of chosen) {
  manifest.voices[gender] = voice.name;
  await mkdir(`public/audio/${gender}/${lessonId}`, { recursive: true });
}
for (const bi of wanted) {
  for (const s of blocks[bi]?.sentences ?? []) {
    const words = s.kn.split(/\s+/).filter(Boolean);
    for (const [gender, voice] of chosen) {
      for (let w = 0; w < words.length; w++) {
        const file = `public/audio/${gender}/${lessonId}/${s.id}${w ? `-w${w}` : ""}.mp3`;
        if (await exists(file)) continue;
        const text = words.slice(w).join(" ");
        const out = await call("text:synthesize", {
          input: { text },
          voice: { languageCode: "kn-IN", name: voice.name },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 },
        });
        await writeFile(file, Buffer.from(out.audioContent, "base64"));
        chars += text.length;
      }
    }
    if (words.length > 1) fromWord.add(`${lessonId}/${s.id}`);
    done.add(`${lessonId}/${s.id}`); // sentence ids repeat across lessons
    process.stdout.write(".");
  }
}
manifest.sentences = [...done].sort();
manifest.fromWord = [...fromWord].sort();
await writeFile(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
console.log(`\nDone: ${manifest.sentences.length} sentences with audio; ${chars} characters sent to Google this run.`);
