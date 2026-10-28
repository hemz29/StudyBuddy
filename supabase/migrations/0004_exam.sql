-- Kali Kannada update (28 Oct 2026): the exam readiness meter.
-- Safe to run more than once.

-- The child's next exam, set by the parent: {"date": "2026-12-05", "lessonIds": [...], "actualMark": 32, "acknowledged": true}.
-- Rows are already limited to the parent's own children by the existing "own children" policy.
alter table public.children add column if not exists exam jsonb;
