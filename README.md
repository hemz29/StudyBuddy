# Kali Kannada (ಕಲಿ ಕನ್ನಡ)

**Kannada, with confidence.** Kannada practice aligned to the ICSE syllabus in Karnataka schools (Grade 6 content today), with progress parents can follow even if they don't speak Kannada. Currently in beta.

A child reads a lesson, practises with quick grammar cards, writes worksheets **by hand**, and sends a phone photo. The app reads the handwriting, the child confirms what was read, and the answers are marked against the teacher's answer key.

Live: https://kali-kannada.vercel.app

## Features

### For families
- **One home page (`/`) for every visitor.** It shows what the app does, how it works, and Hema's story with her portrait. There are three ways in:
  - **Start free – no sign-up** (try without an account)
  - **Create a free account**
  - **Sign in**

  Creating an account and signing in open the same small card with Google and an email link. `/login` forwards here.
- **Guest start:** a family can start with no email (a Supabase anonymous account) and use everything. A "Save your progress" prompt lets them add an email or Google later. They keep the same account and all progress.
- **Sign out:** from the menu, the parent page and the learner picker. Guests are asked to save their progress first.
- **Learn page:** tiles grouped by action:
  - **Learn:** Read & Understand, Grammar, Letters (ಅಕ್ಷರ)
  - **Practise:** Writing practice, Practice tests, Practise speaking (coming soon)
  - **My progress:** My scores
- **Lessons:** Panchatantra, Nanna Desha Nanna Jana and Kugutide Pakshi, in Kannada with English-letter pronunciation and English meaning. Tapping or hovering on any Kannada word shows how to say it and what it means.
- **Grammar cards:** tap drills for opposites, plurals, gender, meanings, word-splitting and rhymes. Wrong choices look like the real answer, so it can't be guessed.
- **Letters:** the Kannada alphabet, vowel signs, double letters and number names.
- **Worksheets and tests:** in the school's Term 1 paper format (PDFs in `public/worksheets/`).
  - Practice tests 1–3: 40 marks, 1 hour.
  - Chapter practice A and B: 25 marks, 40 minutes.
  - There's a timer, and two hints per question:
    - Hint 1 is free.
    - Hint 2 shows choices, with one try. A right pick gets half marks; a wrong pick gets none.
- **Phone upload:** a QR code opens the phone camera page.
- **Handwriting check:** for unsure words the child sees a close-up of their own writing and confirms or corrects what was read. They never type answers.
- **Marking:** most questions are marked in code against the answer key. Sentence answers are marked by Claude against the teacher's model answer, and the marks are always computed in code. If the AI fails, the answer waits for a reviewer.
- **My scores (`/learn/scores`):** the child's latest and best scores, skills and marked worksheets.
- **Parent page (`/parent`):**
  - latest score, skills and score over time
  - history, and a recommended next practice
  - a review page where any mark can be checked or changed
- **Feedback survey (`/feedback`):** 30 seconds, no sign-in. A "Give feedback" button and a floating feedback icon are on the parent page. It ends with a thank-you and a way back to the app.
  - Questions: will you use it for the next test, which prep steps it would replace (several allowed), 0–10 recommend, and an optional comment.
  - `?n=Name` greets the parent by name.
- **About us:** Hema's story, and four contact buttons: Email us, Give feedback, Future plans, Privacy.
- **Future plans:** roadmap ideas (more chapters and Grades 1 to 8, learning as a game, meanings in other languages, a chat for doubts grounded in the lessons and answer key, uploading the teacher's own material, listen and speak, teacher view, phone app, more languages). "Tell us" opens an email.
- **Privacy** page.

### For the owner: admin page (`/admin`, only for `ADMIN_EMAILS`)
- **Feedback:** replies, % who will use it for the next test, NPS, charts and comments.
- **Usage tiles:**
  - parents (with email vs guests) and children
  - active parents, and repeat visitors
  - average visit time
  - worksheets printed, started and finished
  - writing time, average score, hint use, and AI calls
- **Charts:**
  - registrations and weekly active parents
  - worksheets per week
  - sign-up-to-return funnel
  - what families use
  - most read lessons and most started worksheets
  - devices, and busiest days and hours
- **What each child is doing:** days active, time spent, lessons read, cards, worksheets and hints, with plain-language signals, e.g. "Not seen for 9 days" or "Struggling with Grammar".
- **Tables:** families (guests shown as Guest 1, 2…) and every worksheet session.

Page views, worksheet downloads and prints are recorded in `activity_events`.

## Run it locally (demo mode)

```bash
npm install
npm run dev        # http://localhost:3000
```

With no Supabase settings the app runs in **demo mode**: no sign-in, and data is saved in `.data/`. Set `ADMIN_EMAILS=demo@studybuddy.local` to open `/admin`.

## Set up

### Supabase
1. In the SQL editor, run `supabase/migrations/0001_init.sql`, `0002_timer_activity.sql` and `0003_feedback.sql` in that order.
2. Under **Authentication → Sign In / Providers**, turn on Google, **Allow anonymous sign-ins** (for "Start free") and **Allow manual linking** (so guests can save with Google).
3. Under **Authentication → URL Configuration**, set the Site URL to the live address and add `https://<your-app>/**` to the redirect URLs.

### Vercel environment variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (server only) |
| `ANTHROPIC_API_KEY` | Claude API key (model `claude-opus-5-5`; override with `ANTHROPIC_MODEL`) |
| `NEXT_PUBLIC_SITE_URL` | `https://kali-kannada.vercel.app` (used in QR codes and sign-in links) |
| `ADMIN_EMAILS` | Comma-separated emails that can open `/admin` |

## Tests

```bash
npm test               # content, marking, hints, admin stats, NPS
npm run test:rls       # row-level security on a throwaway local Postgres
npm run test:e2e       # browser run-through of the child journey (BASE=http://localhost:3000)
npm run test:handwriting   # reads the real school worksheet pages (needs ANTHROPIC_API_KEY)
```

## Content

- Lessons are in `src/content/grade6/*.ts`, transcribed from the teacher's notes and answer keys. Marks follow `src/content/grade6/marking.json`. After changing them, run `npm run worksheets` to rebuild the PDFs.
- Word meanings: `review/word-meanings.json` is the master list. `review/teacher-review.xlsx` is the sheet for the Kannada educator. Import her answers with `python3 scripts/word_meanings.py import <file.xlsx>`.
- A Kannada educator reviewed the answer key, marking and word meanings on 26 Oct 2026 and made two corrections (ಒಕ್ಕಲು, ಪ್ರತೀತಿ), now applied; her sheet is `review/teacher-review-returned-2026-10-26.xlsx`. Everything else, including the `reviewNote` points, was confirmed as it is. Word cards show "Checked by a Kannada teacher".
