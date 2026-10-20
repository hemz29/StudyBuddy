import type { Worksheet, WorksheetSection } from "@/content";
import type { Question } from "@/content/schema";

// Printable worksheet in the school's format: bilingual instructions, marks per section, answer lines.
const WORD_TYPES = new Set(["meaning_kn", "meaning_en", "en_to_kn", "opposite", "gender", "plural", "split", "rhyme", "number_name"]);
const LINES: Record<string, number> = { one_sentence: 2, who_said: 1, own_sentence: 1, fill_blank: 0 };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function WorksheetPaper({ ws }: { ws: Worksheet }) {
  return (
    <article className="worksheet mx-auto bg-white text-black">
      <header className="text-center">
        <p className="text-lg font-bold tracking-wide">GRADE VI · KANNADA 3rd LANGUAGE · PRACTICE WORKSHEET</p>
        <p className="kn mt-1 text-xl font-bold">{ws.title.kn}</p>
        <p className="text-sm">{ws.title.en}</p>
        <div className="mt-4 flex justify-between text-sm font-bold">
          <span>NAME: ______________________</span>
          <span>DATE: ____________</span>
          <span>Max. Marks: {fmt(ws.totalMarks)}</span>
        </div>
      </header>
      <hr className="my-4 border-black" />
      {ws.sections.map((s, i) => (
        <Section key={s.type} n={i + 1} s={s} poemCues={ws.poemCues} />
      ))}
      <p className="mt-6 text-center text-xs text-gray-500">When you finish, take a clear photo of each page in good light.</p>
    </article>
  );
}

function Section({ n, s, poemCues }: { n: number; s: WorksheetSection; poemCues?: string[] }) {
  const total = s.marksEach * s.questions.length;
  return (
    <section className="ws-section mb-5">
      <div className="flex items-start justify-between gap-4">
        <p className="font-bold">
          {n}. <span className="kn">{s.kn}</span>
          <br />
          <span className="ml-5 text-sm">({s.en})</span>
        </p>
        <span className="whitespace-nowrap text-sm font-bold">({fmt(s.marksEach)}×{s.questions.length}={fmt(total)})</span>
      </div>
      {WORD_TYPES.has(s.type) ? (
        <ol className="mt-2 grid grid-cols-2 gap-x-10 gap-y-4 pl-5">
          {s.questions.map((q, i) => (
            <li key={q.id} className="flex items-end gap-2">
              <span className="whitespace-nowrap">{i + 1}.</span>
              <span className={`${s.type === "en_to_kn" ? "" : "kn"} whitespace-nowrap text-lg`}>{q.prompt}</span>
              <span>–</span>
              <span className="flex-1 border-b border-dotted border-black">&nbsp;</span>
            </li>
          ))}
        </ol>
      ) : s.type === "poem_line" ? (
        <PoemLines questions={s.questions} cues={poemCues} />
      ) : s.type === "poet_name" ? (
        <p className="mt-2 pl-5"><span className="kn">ಕವಿಯ ಹೆಸರು</span>: <span className="inline-block w-72 border-b border-dotted border-black">&nbsp;</span></p>
      ) : (
        <ol className="mt-2 flex flex-col gap-3 pl-5">
          {s.questions.map((q, i) => (
            <li key={q.id}>
              <p className="kn text-lg">
                {i + 1}. {s.type === "fill_blank" ? q.prompt.replace("______", "_______________") : q.prompt}
              </p>
              {Array.from({ length: LINES[s.type] ?? 1 }).map((_, k) => (
                <div key={k} className="ml-5 h-9 border-b border-black/70" />
              ))}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function PoemLines({ questions, cues }: { questions: Question[]; cues?: string[] }) {
  // Stanzas of four lines; as on the school worksheet, only the first word of each stanza is printed.
  const stanzas: Question[][] = [];
  for (let i = 0; i < questions.length; i += 4) stanzas.push(questions.slice(i, i + 4));
  return (
    <div className="mt-2 flex flex-col gap-4 pl-5">
      {stanzas.map((st, si) => (
        <ol key={si} className="flex flex-col gap-1" aria-label={cues?.[si]}>
          {st.map((q, li) => (
            <li key={q.id} className="flex items-end gap-2">
              <span className="kn w-24 text-lg">{li === 0 ? q.prompt.replace(" …", "") : ""}</span>
              <span className="h-9 flex-1 border-b border-black/70" />
            </li>
          ))}
        </ol>
      ))}
    </div>
  );
}
