-- answers table
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now()
);

alter table public.answers enable row level security;

-- policies: signed-in users can insert/select their own rows
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='answers' and policyname='answers_insert_own'
  ) then
    create policy answers_insert_own
      on public.answers for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='answers' and policyname='answers_select_own'
  ) then
    create policy answers_select_own
      on public.answers for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- make sure these tables broadcast realtime
alter publication supabase_realtime add table public.questions;
alter publication supabase_realtime add table public.answers;