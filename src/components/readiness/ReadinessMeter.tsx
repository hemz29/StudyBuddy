import Link from "next/link";
import { getLesson } from "@/content";
import { EXAM_MARKS, levelLabel, type LevelId, type Readiness } from "@/lib/readiness";
import { LEVEL_COLORS, ReadinessDial } from "./ReadinessDial";
import { ReadinessInfo } from "./ReadinessInfo";

const CHEER: Record<LevelId, string> = {
  starting: "Every bit of practice helps. Keep going!",
  getting: "You're getting there!",
  nearly: "You're nearly ready!",
  ready: "You're exam ready! Keep practising so it stays fresh.",
};

const readyMarks = Math.ceil(EXAM_MARKS * 0.8);

export function countdown(r: Readiness) {
  if (r.daysToGo === null) return null;
  if (r.daysToGo > 1) return `Exam in ${r.daysToGo} days`;
  if (r.daysToGo === 1) return "Exam tomorrow";
  if (r.daysToGo === 0) return "Exam today. Good luck!";
  return `Exam was on ${new Date(`${r.exam.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

// The full meter, for My scores (the child) and Parent view (the parent).
export function ReadinessMeter({ r, audience, nickname }: { r: Readiness; audience: "child" | "parent"; nickname: string }) {
  const child = audience === "child";
  const chapters = r.exam.lessonIds.map((id) => getLesson(id)?.title.en).filter(Boolean).join(", ");
  const when = countdown(r);
  return (
    <section className="card bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-bold">Exam readiness</h2>
        {when && <span className="rounded-full bg-black px-3 py-1 text-sm font-medium text-[var(--brand-yellow)]">{when}</span>}
      </div>
      <p className="text-sm text-muted">{chapters}{child ? "" : r.exam.date ? "" : " · no exam date set yet"}</p>

      <div className="mt-4 grid items-center gap-6 md:grid-cols-[18rem_1fr]">
        <div className="flex flex-col items-center">
          <ReadinessDial pct={r.pct} level={r.level} active={r.enoughEvidence} />
          <p className="-mt-1 text-lg font-bold" style={r.enoughEvidence ? { color: LEVEL_COLORS[r.level].text } : undefined}>{r.enoughEvidence ? levelLabel(r.level) : "Not enough practice yet"}</p>
          {r.enoughEvidence && <p className="text-sm text-muted">Likely {r.low}–{r.high} out of {EXAM_MARKS}</p>}
        </div>

        <div className="flex flex-col gap-3">
          {!r.enoughEvidence ? (
            <p className="rounded-2xl bg-accent-soft p-4">
              {child ? "Finish one practice test to see how ready you are." : `${nickname} needs a few more written answers before the meter can make a fair estimate. Usually one full practice test is enough.`}{" "}
              <Link href="/learn/tests" className="font-bold underline">{child ? "Start a practice test →" : "Practice tests →"}</Link>
            </p>
          ) : (
            <p className="text-base">{child ? CHEER[r.level] : `${nickname} is likely to score ${r.low}–${r.high} out of ${EXAM_MARKS} today.`}</p>
          )}

          {r.needsTimedTest && (
            <p className="rounded-2xl border border-[var(--brand-yellow)] p-3 text-sm">
              <b>{child ? "One step to Exam ready:" : "One step left for Exam ready:"}</b> a full practice test in 1 hour, with no hints, scoring {readyMarks}/{EXAM_MARKS} or more.
            </p>
          )}

          {r.gains.length > 0 && (
            <div>
              <h3 className="text-sm font-bold">{child ? "Practise these to win the most marks" : "Where the most marks are to win"}</h3>
              <ul className="mt-1 flex flex-col gap-1 text-sm">
                {r.gains.map((g) => (
                  <li key={g.type}>
                    <Link href={g.href} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 hover:bg-accent-soft">
                      <span>{g.label}</span>
                      <span className="shrink-0 font-bold">up to +{g.marks} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!child && (
            <p className="text-xs text-muted">
              Based on {r.counts.tests} practice test{r.counts.tests === 1 ? "" : "s"}, {r.counts.worksheets} worksheet{r.counts.worksheets === 1 ? "" : "s"} and {r.counts.cardSets} card set{r.counts.cardSets === 1 ? "" : "s"} · {Math.round(r.counts.seenShare * 100)}% of the question bank seen
              {r.mock ? ` · latest full test ${r.mock.pct}%` : ""}
              {r.exam.actualMark != null ? ` · actual exam mark ${r.exam.actualMark}/${EXAM_MARKS}` : ""}
            </p>
          )}
          {child && <p className="text-sm text-muted">Write clearly so your teacher can read every answer ✍️</p>}
          <ReadinessInfo className="self-start" />
        </div>
      </div>
    </section>
  );
}
