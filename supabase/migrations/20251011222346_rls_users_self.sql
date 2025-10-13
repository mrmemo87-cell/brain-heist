alter table public.users enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='self_select_users') then
    create policy self_select_users on public.users
      for select to authenticated
      using (uid = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='self_update_users') then
    create policy self_update_users on public.users
      for update to authenticated
      using (uid = auth.uid())
      with check (uid = auth.uid());
  end if;
end $$;

-- make sure realtime is on
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
\$\$;
