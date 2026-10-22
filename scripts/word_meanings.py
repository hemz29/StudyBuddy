"""Word meanings: build the app's word list and the Kannada teacher's review spreadsheet, and read the teacher's answers back.

  python3 scripts/word_meanings.py export   # review/word-meanings.json -> src/content/grade6/words.json + review/word-meanings-review.xlsx
  python3 scripts/word_meanings.py import review/word-meanings-review.xlsx   # teacher's OK / corrections -> review/word-meanings.json, then export

review/word-meanings.json holds every word with its example sentence, the AI-suggested meaning, confidence and notes.
The app only gets the fields it shows (word, meaning, root, confidence, reviewed).
"""
import json
import sys
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "review" / "word-meanings.json"
APP = ROOT / "src" / "content" / "grade6" / "words.json"
XLSX = ROOT / "review" / "teacher-review.xlsx"
ITEMS = ROOT / "review" / "review-items.json"  # answer-key questions, marking rules and test words, exported from the app content

# Choices for the answer-key questions (picked from a dropdown, so the teacher needn't type Kannada).
KEY_CHOICES = {
    "ವಿದ್ಯಾಭ್ಯಾಸ": ["ವಿದ್ಯ + ಅಭ್ಯಾಸ", "ವಿದ್ಯಾ + ಅಭ್ಯಾಸ", "ವಿದ್ಯೆ + ಅಭ್ಯಾಸ", "Accept all three"],
    "ಅಣ್ಣ": ["ಅಕ್ಕ", "ತಂಗಿ", "Accept both"],
}
EXTRA_KEY_ISSUES = [{"lesson": "Panchatantra", "type": "Change gender", "prompt": "ಹಿರಿಯ", "answers": ["ಕಿರಿಯ"],
                     "note": "Your notes list ಹಿರಿಯ – ಕಿರಿಯ under gender change. It is really an opposite, so the app uses it only as an opposite.",
                     "choices": ["Right: use as an opposite only", "Also use as a gender change"]}]
LESSON = {"panchatantra": "Panchatantra", "nanna-desha": "Nanna Desha Nanna Jana", "kugutide-pakshi": "Kugutide Pakshi"}
ORDER = {"low": 0, "medium": 1, "high": 2}
COLUMNS = ["Word", "Say it", "Lesson", "Line from the lesson", "Line in English", "Suggested meaning (here)",
           "Root word", "Root meaning", "Confidence", "Why it needs checking", "Teacher: OK?", "Teacher: correct meaning", "Teacher: note"]


def export():
    words = json.loads(MASTER.read_text())
    app = [
        {k: w[k] for k in ("word", "en", "base", "baseEn", "confidence") if w.get(k)} | ({"reviewed": True} if w.get("reviewed") else {})
        for w in words
        if not w.get("teacherGlossary")
    ]
    APP.write_text(json.dumps(app, ensure_ascii=False, separators=(",", ":")) + "\n")

    wb = Workbook()
    ws = wb.active
    ws.title = "3. Word meanings"
    ws.append(COLUMNS)
    items = json.loads(ITEMS.read_text())
    in_tests = set(items["testWords"])
    # Words in the practice tests first (they feed hints on Friday), then the least certain.
    rows = sorted((w for w in words if not w.get("teacherGlossary")),
                  key=lambda w: (w.get("reviewed", False), w["word"] not in in_tests, ORDER[w["confidence"]], w["lesson"]))
    fills = {"low": "F9D6D0", "medium": "FBEBCB", "high": "FFFFFF"}
    for w in rows:
        ws.append([w["word"], w.get("say", ""), LESSON.get(w["lesson"], w["lesson"]), w["exampleKn"], w["exampleEn"], w["en"],
                   w.get("base", ""), w.get("baseEn", ""), w["confidence"] + (" (teacher checked)" if w.get("reviewed") else ""),
                   w.get("note", ""), "OK" if w.get("reviewed") else "", w.get("teacherEn", ""), w.get("teacherNote", "")])
        ws.cell(ws.max_row, 9).fill = PatternFill("solid", fgColor=fills[w["confidence"]])
    for c in ws[1]:
        c.font = Font(bold=True)
        c.fill = PatternFill("solid", fgColor="E6EFE8")
    widths = [16, 16, 18, 48, 48, 26, 14, 20, 12, 40, 12, 26, 26]
    for i, wdt in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = wdt
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical="top")
    ok = DataValidation(type="list", formula1='"OK,Change"', allow_blank=True)
    ws.add_data_validation(ok)
    ok.add(f"K2:K{ws.max_row}")
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = ws.dimensions

    key_sheet(wb, items)
    marking_sheet(wb, items)
    wb.move_sheet("3. Word meanings", offset=2)

    how = wb.create_sheet("How to review", 0)
    for line in [
        "StudyBuddy – Grade 6 Kannada: please check these before the pilot",
        "",
        "Your lesson notes, translations and model answers are used as they are. Please only check what is in these tabs.",
        "All corrections can be written in English. Where a Kannada answer is needed, pick it from the dropdown.",
        "",
        "Tab 1 – Answer-key questions (5 rows, about 10 minutes): points in the notes that may be slips. Pick the right answer.",
        "Tab 2 – Marking (about 15 minutes): the answers the app accepts, and what a sentence answer must include to get the mark.",
        "         Choose OK, or Change and write what should change.",
        "Tab 3 – Word meanings: every Kannada word shows its meaning when a child or parent points at it.",
        "         Meanings from your notes are not in this sheet. The ones below were suggested by AI.",
        "         Words in the practice tests come first – please check those before Friday; the rest can wait.",
        "         Red = low confidence, amber = medium. Choose OK, or Change and type the correct English meaning.",
        "",
        "You don't have to finish in one go – whatever you mark is used. Thank you!",
        "",
        f"Words in this sheet: {len(rows)}  ·  low: {sum(w['confidence'] == 'low' for w in rows)}  ·  medium: {sum(w['confidence'] == 'medium' for w in rows)}  ·  high: {sum(w['confidence'] == 'high' for w in rows)}",
    ]:
        how.append([line])
    how["A1"].font = Font(bold=True, size=14)
    how.column_dimensions["A"].width = 110
    XLSX.parent.mkdir(exist_ok=True)
    wb.save(XLSX)
    print(f"{APP.relative_to(ROOT)}: {len(app)} words; {XLSX.relative_to(ROOT)}: {len(rows)} rows")


def header(ws, cols, widths):
    ws.append(cols)
    for c in ws[1]:
        c.font = Font(bold=True)
        c.fill = PatternFill("solid", fgColor="E6EFE8")
    for i, wdt in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = wdt
    ws.freeze_panes = "A2"


def wrap(ws):
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical="top")


def key_sheet(wb, items):
    ws = wb.create_sheet("1. Answer-key questions")
    header(ws, ["Lesson", "Question type", "Word / question", "Answer in the notes", "What we noticed", "Teacher: right answer", "Teacher: note"], [18, 18, 34, 22, 60, 28, 30])
    rows = [{**k, "choices": KEY_CHOICES.get(k["prompt"], ["Notes are right", "Change (see my note)"])} for k in items["keyIssues"]] + EXTRA_KEY_ISSUES
    for k in rows:
        ws.append([k["lesson"], k["type"], k["prompt"], " / ".join(k["answers"]), k["note"], "", ""])
        dv = DataValidation(type="list", formula1='"' + ",".join(k["choices"]) + '"', allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f"F{ws.max_row}")
    wrap(ws)


def marking_sheet(wb, items):
    ws = wb.create_sheet("2. Marking")
    header(ws, ["Lesson", "Question type", "Question", "In English", "Answers the app accepts", "To get the mark, the answer must…", "Model answer (from your notes)", "Teacher: OK?", "Teacher: what to change"],
           [16, 18, 34, 30, 26, 40, 40, 12, 34])
    for m in items["marking"]:
        ws.append([m["lesson"], m["type"], m["prompt"], m["promptEn"], m["accepted"], m["points"], m["model"], "", ""])
    dv = DataValidation(type="list", formula1='"OK,Change"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f"H2:H{ws.max_row}")
    wrap(ws)


def import_review(path):
    words = json.loads(MASTER.read_text())
    by_word = {w["word"]: w for w in words}
    ws = load_workbook(path)["3. Word meanings"]
    changed = 0
    for row in ws.iter_rows(min_row=2, values_only=True):
        word, verdict, correct, note = row[0], (row[10] or "").strip(), (row[11] or "").strip(), (row[12] or "").strip()
        w = by_word.get(word)
        if not w or not verdict:
            continue
        if verdict == "Change" and correct:
            w["teacherEn"], w["en"] = correct, correct
        if verdict == "OK" or (verdict == "Change" and correct):
            w["reviewed"] = True
            changed += 1
        if note:
            w["teacherNote"] = note
    MASTER.write_text(json.dumps(words, ensure_ascii=False, indent=1) + "\n")
    print(f"{changed} words checked by the teacher")
    export()


if __name__ == "__main__":
    {"export": lambda: export(), "import": lambda: import_review(sys.argv[2])}[sys.argv[1]]()
