import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorksheet, MARKING } from "@/content";
import { StartButton } from "./StartButton";
import { KnText } from "@/components/Word";

export default async function WorksheetIntro({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ retry?: string }> }) {
  const ws = getWorksheet((await params).id);
  if (!ws || ws.retired) notFound();
  const { retry } = await searchParams;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link href={ws.kind === "test" ? "/learn/tests" : "/learn/writing"} className="text-sm font-bold text-accent">← Back</Link>
      <div className="card bg-white/90 p-6">
        <p className="text-sm font-bold text-muted">{ws.kind === "test" ? "Practice test" : "Chapter practice"} · {ws.totalMarks} marks · {ws.minutes === 60 ? "1 hour" : `${ws.minutes} minutes`}</p>
        <h1 className="mt-1 text-3xl">{ws.title.en}</h1>
        <p className="text-xl text-muted"><KnText text={ws.title.kn} /></p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {ws.sections.map((s, i) => (
            <li key={s.type} className="flex items-baseline justify-between gap-3 rounded-xl bg-accent-soft px-3 py-2 text-sm">
              <span>{i + 1}. {s.en}</span>
              <span className="whitespace-nowrap font-bold">{s.questions.length * s.marksEach}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">{MARKING.label}</p>
      </div>

      <div className="card bg-white/90 p-6">
        <h2 className="text-xl">How it works</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {[
            ["🖨️", "Print the worksheet (or copy the questions into your notebook with the same numbers)."],
            ["⏱️", `Press “I'm ready” when you start writing. A ${ws.minutes === 60 ? "1-hour" : `${ws.minutes}-minute`} timer starts. If time runs out, you can still finish.`],
            ["✍️", "Write your answers by hand. The questions also show on this screen. Hint 1 is free; Hint 2 shows choices and gives half marks for that answer."],
            ["📷", "Take a photo of each page with a phone – scan the QR code that appears here."],
            ["✅", "Check that we read your writing correctly, then see your marks."],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-3"><span className="text-2xl">{icon}</span><span className="pt-1">{text}</span></li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`/worksheets/${ws.id}.pdf`} target="_blank" rel="noreferrer" className="btn btn-ghost">Download PDF</a>
          <Link href={`/print/worksheet/${ws.id}`} target="_blank" className="btn btn-ghost">Print from browser</Link>
          <StartButton worksheetId={ws.id} retryOf={retry ?? null} />
        </div>
      </div>
    </div>
  );
}
