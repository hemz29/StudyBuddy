// Measures how well Claude reads a real child's Kannada handwriting.
// Uses the three photographed pages of the school's Grade VI worksheet and compares each reading
// with what the child actually wrote (read by eye, in src/content/grade6/sampleAnswers.ts).
//
// Run (needs ANTHROPIC_API_KEY):  npm run test:handwriting
import { readFile } from "node:fs/promises";
import { getWorksheet, worksheetQuestionNumber } from "../src/content";
import { SCHOOL_WORKSHEET_ANSWERS } from "../src/content/grade6/sampleAnswers";
import { readAnswerPage } from "../src/lib/ai";
import { compactKn, editDistance, graphemes } from "../src/lib/grading/normalize";

const ws = getWorksheet("term-practice-1")!;
const questions = ws.sections.flatMap((s) => s.questions.map((q) => ({ number: worksheetQuestionNumber(ws, q.id), prompt: q.prompt, kind: s.en, id: q.id })));
const byNumber = new Map(questions.map((q) => [q.number, q.id]));

async function main() {
  let letters = 0;
  let letterErrors = 0;
  let exact = 0;
  let found = 0;
  let lowConfidence = 0;
  let lowWhenWrong = 0;
  const wrong: string[] = [];

  for (const page of [1, 2, 3]) {
    const data = await readFile(`tests/handwriting/school-worksheet-p${page}.jpg`);
    const reading = await readAnswerPage({ base64: data.toString("base64"), mediaType: "image/jpeg" }, questions, "handwriting-test", async (e) =>
      console.log(`page ${page}: ${e.inputTokens} in / ${e.outputTokens} out tokens, ${(e.ms / 1000).toFixed(1)}s`),
    );
    console.log(`page ${page}: quality ${reading.pageQuality}, ${reading.answers.length} answers`);
    for (const a of reading.answers) {
      const qid = byNumber.get(a.questionNumber.trim());
      const truth = qid && SCHOOL_WORKSHEET_ANSWERS[qid];
      if (!truth) continue;
      found++;
      const t = graphemes(compactKn(truth));
      const d = editDistance(graphemes(compactKn(a.text)), t);
      letters += t.length;
      letterErrors += d;
      if (a.confidence === "low") lowConfidence++;
      if (d === 0) exact++;
      else {
        if (a.confidence === "low") lowWhenWrong++;
        wrong.push(`${a.questionNumber} [${a.confidence}] read "${a.text}" — child wrote "${truth}"`);
      }
    }
  }

  const total = Object.keys(SCHOOL_WORKSHEET_ANSWERS).length;
  console.log(`\nAnswers found: ${found} of ${total}`);
  console.log(`Read exactly right: ${exact} of ${found} (${Math.round((exact / found) * 100)}%)`);
  console.log(`Letter accuracy: ${(100 - (letterErrors / letters) * 100).toFixed(1)}%`);
  console.log(`Marked unsure (child checks these): ${lowConfidence}; of the misreads, ${lowWhenWrong} of ${wrong.length} were marked unsure`);
  if (wrong.length) console.log("\nMisreads:\n" + wrong.join("\n"));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
