import { getLesson, getQuestion, getWorksheet, LESSONS, SECTION_TEXT, TERM_PAPER } from "@/content";
import type { QuestionType } from "@/content/schema";
import type { AttemptScore, ExamPlan, PracticeSession } from "@/lib/store/types";

// Exam readiness: an estimate of the exam mark, worked out from saved answers – no AI involved.
// The plain-language version of these rules is in components/ReadinessInfo.tsx; keep the two in step.

export const EXAM_MARKS = 40;
const DAY = 864e5;
const HALF_LIFE_DAYS = 21; // an answer from 3 weeks ago counts half as much as one from today
const PRIOR = { answers: 1, score: 0.4 }; // every skill starts as "unknown": one pretend answer at 40%
const CARD_WEIGHT = 0.35; // a tap card is easier than writing the answer…
const CARD_CEILING = 0.75; // …so cards alone can't show a skill as more than 75% known
// Credit for an answer written with no hint, Hint 1, Hint 2. Marking already halves Hint 2 answers
// (withHintPenalty), so 0.8 on top makes them count 40% in all; Hint 1 isn't penalised in marking, so it's 0.7 here.
const HINT_CREDIT = [1, 0.7, 0.8];
const MOCK_DAYS = 21; // a full practice test this recent is blended into the estimate…
const MOCK_SHARE = 0.5; // …at this share
const READY_DAYS = 14; // "Exam ready" needs a full test this recent: on time, no hints, 80%+
const MIN_EVIDENCE = 0.6; // share of the paper's marks that need written answers before any estimate
const Z90 = 1.64; // the range covers about 9 in 10 outcomes

export const LEVELS = [
  { id: "starting", label: "Just starting", from: 0 },
  { id: "getting", label: "Getting there", from: 50 },
  { id: "nearly", label: "Nearly ready", from: 70 },
  { id: "ready", label: "Exam ready", from: 85 },
] as const;
export type LevelId = (typeof LEVELS)[number]["id"];

// Short names for each kind of question, for the "most marks to win" list.
const SHORT: Record<QuestionType, string> = {
  meaning_kn: "Kannada meanings", meaning_en: "English meanings", en_to_kn: "English words in Kannada", opposite: "Opposites",
  gender: "Changing gender", plural: "Plurals", split: "Splitting words", one_sentence: "One-sentence answers",
  who_said: "Who said to whom", own_sentence: "Making your own sentences", number_name: "Number names",
  poem_line: "Poem lines by heart", poet_name: "The poet's name", fill_blank: "Fill in the blanks", rhyme: "Rhyming words",
};

export type TypeReadiness = {
  type: QuestionType;
  label: string;
  marks: number; // marks this kind of question is worth in the exam
  mastery: number; // 0–1
  expected: number; // marks × mastery
  written: number; // written answers counted (after fading)
  cards: number; // card answers counted (after fading)
  seen: number; // questions of this kind met at least once
  pool: number; // questions of this kind in the exam's chapters
};

export type Readiness = {
  exam: ExamPlan;
  chaptersChosen: boolean; // the parent picked the chapters (otherwise every chapter counts)
  daysToGo: number | null;
  enoughEvidence: boolean;
  evidenceShare: number; // share of the paper's marks backed by written answers
  predicted: number; // out of 40
  low: number;
  high: number;
  pct: number; // predicted ÷ 40, as a whole %
  level: LevelId;
  // What's still missing for the next level (only the timed-test rule can hold back "Exam ready").
  needsTimedTest: boolean;
  mock: { title: string; pct: number; date: string } | null;
  types: TypeReadiness[];
  gains: { type: QuestionType; label: string; marks: number; href: string }[];
  counts: { tests: number; worksheets: number; cardSets: number; seenShare: number };
};

const allLessonIds = () => LESSONS.map((l) => l.id);

// The exam paper for the chosen chapters: the term paper's marks per kind of question, keeping only the kinds those
// chapters can ask. If some kinds are missing (e.g. no poem), chapter-only kinds (fill in the blanks, rhyming words)
// fill the gap at 2 marks each, and everything is scaled back to 40. Panchatantra + Nanna Desha is the real paper.
export function examBlueprint(lessonIds: string[]): Partial<Record<QuestionType, number>> {
  const ids = lessonIds.length ? lessonIds : allLessonIds();
  const available = new Set<QuestionType>(["number_name"]);
  for (const id of ids) for (const ex of getLesson(id)?.exercises ?? []) if (ex.questions.length) available.add(ex.type);
  const raw: Partial<Record<QuestionType, number>> = {};
  for (const [type, marks] of Object.entries(TERM_PAPER) as [QuestionType, number][]) if (available.has(type)) raw[type] = marks;
  const missing = Object.keys(TERM_PAPER).some((t) => !raw[t as QuestionType]);
  if (missing) for (const type of ["fill_blank", "rhyme"] as QuestionType[]) if (available.has(type) && !raw[type]) raw[type] = 2;
  const total = Object.values(raw).reduce((t, m) => t + m, 0);
  return Object.fromEntries(Object.entries(raw).map(([t, m]) => [t, (m * EXAM_MARKS) / total]));
}

const daysBetween = (from: number, to: number) => (to - from) / DAY;
const fade = (createdAt: string, now: number) => 0.5 ** (Math.max(0, daysBetween(Date.parse(createdAt), now)) / HALF_LIFE_DAYS);
const helpFree = (s: PracticeSession) => Object.values(s.help ?? {}).every((l) => !l);
const onTime = (s: PracticeSession) => {
  const minutes = getWorksheet(s.worksheetId)?.minutes ?? 60;
  return !s.writingDoneAt || Date.parse(s.writingDoneAt) - Date.parse(s.startedAt) <= minutes * 60_000;
};

// Where to practise a kind of question.
function practiceHref(type: QuestionType, lessonIds: string[]) {
  if (type === "number_name") return "/learn/numbers";
  if (type === "poem_line" || type === "poet_name" || type === "rhyme") return "/learn/lesson/nanna-desha";
  if (["meaning_kn", "opposite", "gender", "plural", "split"].includes(type)) return `/learn/cards/${lessonIds[0] ?? "panchatantra"}`;
  return "/learn/writing";
}

export function readiness(attempts: AttemptScore[], sessions: PracticeSession[], plan: ExamPlan | null | undefined, now = Date.now()): Readiness {
  const exam: ExamPlan = { date: plan?.date ?? null, lessonIds: plan?.lessonIds?.length ? plan.lessonIds : allLessonIds(), actualMark: plan?.actualMark ?? null, acknowledged: plan?.acknowledged };
  const inExam = new Set(exam.lessonIds);
  const blueprint = examBlueprint(exam.lessonIds);
  const byId = new Map(sessions.map((s) => [s.id, s]));

  const types: TypeReadiness[] = (Object.entries(blueprint) as [QuestionType, number][]).map(([type, marks]) => {
    const relevant = attempts.filter((a) => {
      if (a.type !== type || a.awarded === null || a.status === "review" || !a.max) return false;
      const lessonId = getQuestion(a.questionId)?.lessonId;
      return type === "number_name" || (lessonId !== undefined && inExam.has(lessonId));
    });
    let weight = 0;
    let credit = 0;
    let written = 0;
    let cards = 0;
    for (const a of relevant) {
      const isCard = byId.get(a.sessionId)?.kind === "cards";
      const w = fade(a.createdAt, now) * (isCard ? CARD_WEIGHT : 1);
      const score = (a.awarded ?? 0) / a.max;
      const c = isCard ? score * CARD_CEILING : score * HINT_CREDIT[Math.min(a.helpLevel ?? 0, 2)];
      weight += w;
      credit += w * c;
      if (isCard) cards += w;
      else written += w;
    }
    const pool =
      type === "number_name"
        ? 50
        : exam.lessonIds.reduce((t, id) => t + (getLesson(id)?.exercises.filter((e) => e.type === type).reduce((n, e) => n + e.questions.length, 0) ?? 0), 0);
    const seen = new Set(relevant.map((a) => a.questionId)).size;
    const coverage = pool ? Math.min(1, seen / pool) : 1;
    const known = (PRIOR.answers * PRIOR.score + credit) / (PRIOR.answers + weight);
    // The exam can ask any word from the chapter, so skill shown on a few words counts for a little less.
    const mastery = known * (0.85 + 0.15 * coverage);
    return { type, label: SHORT[type] ?? SECTION_TEXT[type].en, marks, mastery, expected: marks * mastery, written, cards, seen, pool };
  });

  let predicted = types.reduce((t, x) => t + x.expected, 0);
  const variance = types.reduce((t, x) => t + (x.marks ** 2 * x.mastery * (1 - x.mastery)) / (PRIOR.answers + x.written + x.cards), 0);

  // A recent full practice test on these chapters is the strongest single sign, so it's blended in.
  const tests = sessions
    .filter((s) => s.kind === "worksheet" && s.status === "graded" && s.max && getWorksheet(s.worksheetId)?.kind === "test")
    .filter((s) => (getWorksheet(s.worksheetId)?.lessonIds ?? []).some((id) => inExam.has(id)))
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const recentMock = tests.find((s) => !s.retryOf && daysBetween(Date.parse(s.completedAt ?? s.startedAt), now) <= MOCK_DAYS);
  const mock = recentMock
    ? { title: getWorksheet(recentMock.worksheetId)?.title.en ?? "Practice test", pct: Math.round(((recentMock.awarded ?? 0) / recentMock.max!) * 100), date: recentMock.completedAt ?? recentMock.startedAt }
    : null;
  if (mock) predicted = (1 - MOCK_SHARE) * predicted + MOCK_SHARE * (mock.pct / 100) * EXAM_MARKS;

  const spread = Z90 * Math.sqrt(variance) * (mock ? 0.8 : 1);
  const evidenceShare = types.filter((t) => t.written > 0).reduce((s, t) => s + t.marks, 0) / EXAM_MARKS;
  const pct = Math.round((predicted / EXAM_MARKS) * 100);
  const readyTest = tests.some(
    (s) => daysBetween(Date.parse(s.completedAt ?? s.startedAt), now) <= READY_DAYS && helpFree(s) && onTime(s) && (s.awarded ?? 0) / s.max! >= 0.8,
  );
  let level: LevelId = [...LEVELS].reverse().find((l) => pct >= l.from)!.id;
  const needsTimedTest = level === "ready" && !readyTest;
  if (needsTimedTest) level = "nearly";

  // Calendar days from today to the exam day (0 on the day itself).
  const today = new Date(now);
  const daysToGo = exam.date ? Math.round(daysBetween(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime(), new Date(`${exam.date}T00:00:00`).getTime())) : null;
  const gains = [...types]
    .map((t) => ({ type: t.type, label: t.label, marks: Math.round(t.marks * (1 - t.mastery)), href: practiceHref(t.type, exam.lessonIds) }))
    .filter((g) => g.marks >= 1)
    .sort((a, b) => b.marks - a.marks)
    .slice(0, 3);
  const graded = sessions.filter((s) => s.status === "graded");
  const seenTotal = types.reduce((t, x) => t + x.seen, 0);
  const poolTotal = types.reduce((t, x) => t + x.pool, 0);

  return {
    exam,
    chaptersChosen: Boolean(plan?.lessonIds?.length),
    daysToGo,
    enoughEvidence: evidenceShare >= MIN_EVIDENCE,
    evidenceShare,
    predicted,
    low: Math.max(0, Math.round(predicted - spread)),
    high: Math.min(EXAM_MARKS, Math.round(predicted + spread)),
    pct,
    level,
    needsTimedTest,
    mock,
    types,
    gains,
    counts: {
      tests: tests.length,
      worksheets: graded.filter((s) => s.kind === "worksheet").length,
      cardSets: graded.filter((s) => s.kind === "cards").length,
      seenShare: poolTotal ? seenTotal / poolTotal : 0,
    },
  };
}

export const levelLabel = (id: LevelId) => LEVELS.find((l) => l.id === id)!.label;
