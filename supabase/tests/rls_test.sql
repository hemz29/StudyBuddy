-- Two families; each must only ever see and write their own rows.
\set ON_ERROR_STOP on
insert into auth.users values ('aaaaaaaa-0000-4000-8000-000000000001'), ('bbbbbbbb-0000-4000-8000-000000000002');
insert into public.children (id, parent_id, nickname) values
  ('a0000000-0000-4000-8000-00000000000a', 'aaaaaaaa-0000-4000-8000-000000000001', 'Anika'),
  ('b0000000-0000-4000-8000-00000000000b', 'bbbbbbbb-0000-4000-8000-000000000002', 'Bharat');
insert into public.practice_sessions (id, parent_id, child_id, kind, worksheet_id, marking_version) values
  ('a1000000-0000-4000-8000-00000000000a', 'aaaaaaaa-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000a', 'worksheet', 'term-practice-1', 'v'),
  ('b1000000-0000-4000-8000-00000000000b', 'bbbbbbbb-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-00000000000b', 'worksheet', 'term-practice-1', 'v');
insert into public.question_attempts (parent_id, session_id, child_id, question_id, type, skill, max, marking_version) values
  ('bbbbbbbb-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-00000000000b', 'b0000000-0000-4000-8000-00000000000b', 'q', 'opposite', 'grammar', 1, 'v');
grant usage on schema public, storage to authenticated;
grant all on all tables in schema public, storage to authenticated;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
do $$
begin
  assert (select count(*) from public.children) = 1, 'parent A sees only their child';
  assert (select nickname from public.children) = 'Anika', 'and it is Anika';
  assert (select count(*) from public.practice_sessions) = 1, 'only own sessions';
  assert (select count(*) from public.question_attempts) = 0, 'cannot see B''s attempts';
  update public.children set nickname = 'hacked' where id = 'b0000000-0000-4000-8000-00000000000b';
  begin
    insert into public.children (parent_id, nickname) values ('bbbbbbbb-0000-4000-8000-000000000002', 'x');
    raise exception 'insert for another parent should fail';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values ('answer-pages', 'bbbbbbbb-0000-4000-8000-000000000002/s/p.jpg');
    raise exception 'upload into another parent folder should fail';
  exception when insufficient_privilege then null;
  end;
  insert into storage.objects (bucket_id, name) values ('answer-pages', 'aaaaaaaa-0000-4000-8000-000000000001/s/p.jpg');
end $$;
reset role;
do $$ begin assert (select nickname from public.children where id = 'b0000000-0000-4000-8000-00000000000b') = 'Bharat', 'B unchanged'; end $$;
select 'RLS OK' as result;
