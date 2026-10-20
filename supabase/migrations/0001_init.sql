-- StudyBuddy pilot schema. Every row carries parent_id; RLS lets a signed-in parent see only their own rows.
-- Lessons, questions and marking live in the app's content files, not the database.

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 40),
  theme text not null default 'space',
  created_at timestamptz not null default now()
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  kind text not null check (kind in ('worksheet', 'cards')),
  worksheet_id text not null,
  retry_of uuid references public.practice_sessions(id) on delete set null,
  status text not null default 'writing',
  marking_version text not null,
  help jsonb not null default '{}',
  awarded numeric,
  max numeric,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.page_uploads (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  image_key text not null,
  status text not null default 'received',
  error text,
  created_at timestamptz not null default now()
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  question_id text not null,
  type text not null,
  skill text not null,
  page_id uuid references public.page_uploads(id) on delete set null,
  region jsonb,
  text text not null default '',
  confidence text not null default 'high',
  uncertain_words jsonb not null default '[]',
  reading_confirmed boolean not null default false,
  misread_flagged boolean not null default false,
  help_level int not null default 0,
  awarded numeric,
  max numeric not null,
  status text,
  method text,
  feedback jsonb,
  marking_version text not null,
  created_at timestamptz not null default now()
);

-- Single-use links that let a phone upload answer photos for one session without signing in.
create table public.upload_tokens (
  token text primary key,
  parent_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

-- Cost and latency of every AI call. No answer text or images are stored here.
create table public.ai_usage_events (
  id bigint generated always as identity primary key,
  parent_id uuid references auth.users(id) on delete set null,
  session_id uuid references public.practice_sessions(id) on delete set null,
  purpose text not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  ms int not null default 0,
  ok boolean not null,
  error text,
  created_at timestamptz not null default now()
);

create index on public.children (parent_id);
create index on public.practice_sessions (child_id, started_at);
create index on public.question_attempts (child_id, created_at);
create index on public.question_attempts (session_id);
create index on public.page_uploads (session_id);

alter table public.children enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.page_uploads enable row level security;
alter table public.question_attempts enable row level security;
alter table public.upload_tokens enable row level security;
alter table public.ai_usage_events enable row level security;

create policy "own children" on public.children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own sessions" on public.practice_sessions
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own pages" on public.page_uploads
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own attempts" on public.question_attempts
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own tokens" on public.upload_tokens
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "own usage" on public.ai_usage_events
  for insert with check (parent_id = auth.uid());

-- Answer photos: private bucket, files stored under <parent_id>/...
insert into storage.buckets (id, name, public) values ('answer-pages', 'answer-pages', false)
  on conflict (id) do nothing;
create policy "own answer pages" on storage.objects
  for all using (bucket_id = 'answer-pages' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'answer-pages' and (storage.foldername(name))[1] = auth.uid()::text);
