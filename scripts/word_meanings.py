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
XLSX = ROOT / "review" / "word-meanings-review.xlsx"
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
    ws.title = "Word meanings"
    ws.append(COLUMNS)
    rows = sorted((w for w in words if not w.get("teacherGlossary")), key=lambda w: (w.get("reviewed", False), ORDER[w["confidence"]], w["lesson"]))
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

    how = wb.create_sheet("How to review", 0)
    for line in [
        "StudyBuddy – word meanings for the Kannada teacher to check",
        "",
        "Every Kannada word in the three Grade 6 lessons shows its meaning when a child or parent hovers over it.",
        "Meanings from your notes are already marked 'From teacher's notes' and are not in this sheet.",
        "The meanings below were suggested by AI and are labelled 'AI-suggested' in the app until you check them.",
        "",
        "Rows are sorted with the least certain first (red = low confidence, amber = medium).",
        "For each row: choose OK in column K if the meaning is right for that line.",
        "If it is wrong, choose Change and write the correct English meaning in column L (and a note in M if useful).",
        "You don't have to finish in one go – whatever you mark is used.",
        "",
        f"Words in this sheet: {len(rows)}  ·  low: {sum(w['confidence'] == 'low' for w in rows)}  ·  medium: {sum(w['confidence'] == 'medium' for w in rows)}  ·  high: {sum(w['confidence'] == 'high' for w in rows)}",
    ]:
        how.append([line])
    how["A1"].font = Font(bold=True, size=14)
    how.column_dimensions["A"].width = 110
    XLSX.parent.mkdir(exist_ok=True)
    wb.save(XLSX)
    print(f"{APP.relative_to(ROOT)}: {len(app)} words; {XLSX.relative_to(ROOT)}: {len(rows)} rows")


def import_review(path):
    words = json.loads(MASTER.read_text())
    by_word = {w["word"]: w for w in words}
    ws = load_workbook(path)["Word meanings"]
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
