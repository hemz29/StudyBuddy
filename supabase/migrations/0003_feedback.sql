-- Quick feedback from parents (/feedback). Anyone with the link can answer, signed in or not, so rows are written and
-- read only by the server with the service role; no one reads them from the browser.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  parent_id uuid references auth.users(id) on delete set null,
  name text,
  answers jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
