-- StudyBuddy update (22 Oct 2026): worksheet timer and the owner's admin page.
-- Safe to run more than once.

-- When the child said they had finished writing (the timer starts when the session is created, at "I'm ready").
alter table public.practice_sessions add column if not exists writing_done_at timestamptz;

-- Which pages parents and children open, for the owner's admin page. Rows are written by the signed-in parent;
-- only the service role (the admin page on the server) reads across families.
create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  parent_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  kind text not null,
  path text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists activity_events_parent_idx on public.activity_events (parent_id, created_at);

alter table public.activity_events enable row level security;
drop policy if exists "own activity" on public.activity_events;
create policy "own activity" on public.activity_events
  for insert with check (parent_id = auth.uid());
