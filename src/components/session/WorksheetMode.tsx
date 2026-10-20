"use client";
import { useState } from "react";
import { getWorksheet } from "@/content";
import type { Question } from "@/content/schema";
import { helpSteps } from "@/lib/help";
import { transliterate } from "@/lib/transliterate";
import type { PracticeSession } from "@/lib/store/types";

// The worksheet questions in large type while the child writes on paper, each with an "I'm stuck" button.
export function WorksheetMode({ session, worksheetId }: { session: PracticeSession; worksheetId: string }) {
  const ws = getWorksheet(worksheetId)!;
  const [help, setHelp] = useState<Record<string, number>>(session.help);

  async function openHelp(q: Question) {
    const level = Math.min(4, (help[q.id] ?? 0) + 1);
    setHelp((h) => ({ ...h, [q.id]: level }));
    await fetch(`/api/sessions/${session.id}/help`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: q.id, level }) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center gap-3 p-5">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold">{ws.title.en}</h1>
          <p className="text-muted">Write your answers on paper. Use the same numbers as below.</p>
        </div>
        <a href={`/worksheets/${ws.id}.pdf`} target="_blank" rel="noreferrer" className="btn btn-ghost">Worksheet PDF</a>
      </div>

      {ws.sections.map((s, si) => (
        <section key={s.type} className="paper p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold">
              {si + 1}. <span className="kn">{s.kn}</span>
              <span className="block text-sm font-normal text-gray-500">{s.en}</span>
            </h2>
            <span className="chip bg-gray-100 text-gray-700">{s.marksEach * s.questions.length} marks</span>
          </div>
          <ol className="mt-3 flex flex-col divide-y divide-gray-100">
            {s.questions.map((q, qi) => {
              const level = help[q.id] ?? 0;
              const steps = helpSteps(q);
              const poemHidden = s.type === "poem_line" && qi % 4 !== 0;
              return (
                <li key={q.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 shrink-0 font-bold text-gray-500">{si + 1}.{qi + 1}</span>
                    <div className="flex-1">
                      <p className={`${s.type === "en_to_kn" ? "" : "kn"} text-2xl`}>{poemHidden ? "…" : q.prompt.replace(" …", "")}</p>
                      {!poemHidden && s.type !== "en_to_kn" && <p className="text-sm italic text-gray-500">{transliterate(q.prompt.replace(" …", ""))}</p>}
                    </div>
                    <button onClick={() => openHelp(q)} disabled={level >= 4} className="chip h-9 shrink-0 bg-warn-soft px-3 text-warn">
                      {level === 0 ? "I'm stuck" : level < 4 ? "More help" : "All help shown"}
                    </button>
                  </div>
                  {level > 0 && (
                    <div className="mt-3 flex flex-col gap-2 pl-13">
                      {steps.slice(0, level).map((st, i) => (
                        <div key={i} className="rounded-xl bg-yellow-50 px-4 py-2">
                          <p className="text-xs font-bold uppercase tracking-wide text-yellow-800">Step {i + 1}: {st.title}</p>
                          <p className="whitespace-pre-line text-gray-800">{st.body}</p>
                          {st.kn && <p className="kn mt-1 text-xl">{st.kn}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
