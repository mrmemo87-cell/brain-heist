-- answers table: no FK to questions_import2 because it has no id column
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id bigint,                                -- optional reference value only
  user_id uuid not null references auth.users(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now()
);

alter table public.answers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_self_select') then
    create policy answers_self_select on public.answers
      for select to authenticated
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_self_insert') then
    create policy answers_self_insert on public.answers
      for insert to authenticated
      with check (user_id = auth.uid());
  end if;
end $$;

alter publication supabase_realtime add table public.answers;
