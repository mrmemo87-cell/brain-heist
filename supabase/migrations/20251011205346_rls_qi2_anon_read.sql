alter table public.questions_import2 enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='questions_import2' and policyname='anon_read_questions_import2'
  ) then
    create policy anon_read_questions_import2
      on public.questions_import2
      for select
      to anon
      using (true);
  end if;
end $$;
