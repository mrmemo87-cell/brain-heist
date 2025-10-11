-- enable RLS (no-op if already enabled)
alter table if exists public.questions enable row level security;

-- create select policy for anon if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'questions' and policyname = 'anon_read_questions'
  ) then
    create policy anon_read_questions
      on public.questions
      for select
      to anon
      using (true);
  end if;
end $$;