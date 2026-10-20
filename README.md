# StudyBuddy

Enabling parents to help their children learn Kannada confidently.


Grade 6 Kannada (3rd language) practice for the Friday pilot. A child reads a lesson, writes a worksheet **by hand**, and sends a phone photo. The app reads the handwriting, the child confirms what was read, and then the answers are marked. Parents can follow progress without knowing Kannada.

## What's in the pilot

- **Lessons:** Panchatantra, Nanna Desha Nanna Jana and Kugutide Pakshi, from the teacher's notes. Each is shown in Kannada with a pronunciation aid in English letters and the English meaning, and words can be tapped.
- **Practice cards:** quick tap drills for opposites, plurals, gender, meanings, word-splitting and rhymes.
- **Worksheets:** seven, in the school's format.
  - Term practice 1 mirrors the school's Grade VI worksheet.
  - Each chapter has two sets, A and B.
  - All are PDFs in `public/worksheets/`, with marks shown per section.
- **"I'm stuck":** four help steps per question. Using help never costs marks; the app records it so the dashboard can show how independently the child worked.
- **Phone upload:** the desktop shows a QR code. The phone page (`/snap/<token>`) takes a camera photo or a gallery photo, compresses it and sends it. Photos can also be uploaded from the computer.
- **Handwriting check:**
  - Answers the AI reads with confidence go straight to marking.
  - For unsure words, the child sees their own writing next to what was read. They confirm it, or pick one of the AI's alternative readings.
  - They can never type an answer.
- **Marking:**
  - Most question types are marked **in code** against the teacher's answer key, with spelling near-miss feedback.
  - One-sentence and own-sentence answers are marked by Claude against the teacher's model answer, rubric point by rubric point. The marks themselves are always computed in code.
  - If the AI fails, the answer waits for a reviewer. The app never invents a mark.
- **Parent dashboard (`/parent`):**
  - Latest score and questions answered.
  - Share of answers written without help.
  - Skills, with "not practised yet" shown separately from low scores.
  - Score over time (first tries only).
  - History and a recommendation, made only when there's enough evidence.
  - A review page where any mark can be checked or changed.
- **Themes:** the child picks one of Kitten, Space, Flowers, Speed & gadgets or Shapes. The reading and checking areas always stay white.

Marks follow `src/content/grade6/marking.json`, currently the school's Grade 5 Term 1 pattern of 1 mark per item. To change marks, edit that file and run `npm run worksheets` to rebuild the PDFs.

## Run it on your computer (demo mode)

```bash
npm install
npm run dev        # http://localhost:3000
```

Without any settings, the app runs in **demo mode**:
- There is no sign-in, and data is saved in `.data/` on this computer.
- "Term practice 1" shows the real child's answers from the school worksheet when you upload any photo, so the full flow can be tried without an AI key.

## Go live (for Friday)

### 1. Supabase (database and sign-in)
1. Create a project at supabase.com. The free tier is fine.
2. In the **SQL editor**, run `supabase/migrations/0001_init.sql`. This creates the tables, the row-level security rules and the private `answer-pages` photo bucket.
3. Under **Authentication → URL configuration**, set the Site URL to your Vercel URL and add `https://<your-app>/auth/callback` to the redirect URLs.
4. Copy the project URL, the `anon` key and the `service_role` key from **Project settings → API**.

### 2. Claude API key
Create a key at console.anthropic.com and add some credit. The app uses `claude-opus-5-5`; override it with `ANTHROPIC_MODEL` if needed.

Check handwriting accuracy first. This runs the three real school worksheet pages and prints the reading accuracy, misreads and token use:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run test:handwriting
```

### 3. Vercel
Import the GitHub repo into Vercel and add these environment variables:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (server only; never shared) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://studybuddy-kannada.vercel.app` (used in QR codes) |

Reading a page takes about a minute. The upload routes allow up to 300 seconds, which needs a Vercel plan that supports it (Fluid compute is on by default).

## Tests

```bash
npm test               # content, answer-key marking on the real school worksheet, grading rules, dashboard maths
npm run test:rls       # migration and row-level security on a throwaway local Postgres (family A can't see family B)
npm run test:e2e       # browser run-through of the child journey (needs the app running; BASE=http://localhost:3000)
npm run test:handwriting
```

## Content

- **Lessons** live in `src/content/grade6/*.ts`. They were transcribed from the teacher's notes, which have English translations and answer keys.
- **`reviewNote` fields** mark points for the Kannada reviewer to confirm:
  - Panchatantra gender change "ಅಣ್ಣ – ತಂಗಿ": the usual pair is ಅಕ್ಕ. Both are accepted for now.
  - "ಹಿರಿಯ – ಕಿರಿಯ" is in the notes' gender list but is an opposite, so it was left out.
  - Split: "ವಿದ್ಯಾಭ್ಯಾಸ = ವಿದ್ಯ + ಅಭ್ಯಾಸ". ವಿದ್ಯಾ/ವಿದ್ಯೆ are also accepted.
  - The fill-in-the-blank position for "ಹಸಿರೇ ನಮ್ಮ ಉಸಿರು".
  - Divya's decision (Kugutide Pakshi Q6).
- **What the child wrote** on the school worksheet, read by eye, is in `src/content/grade6/sampleAnswers.ts`. It is used for tests and demo mode.
