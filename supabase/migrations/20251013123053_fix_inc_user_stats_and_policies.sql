-- ensure we own the signature to avoid 42P13 (return type mismatch)
drop function if exists public.rpc_inc_user_stats(integer, integer);

create function public.rpc_inc_user_stats(
  p_xp_delta integer default 0,
  p_creds_delta integer default 0
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $
declare
  v_uid uuid;
begin
  select auth.uid() into v_uid;
  if v_uid is null then
    raise exception 'auth.uid() is null' using errcode = '42501';
  end if;

  update public.users
  set xp    = greatest(0, coalesce(xp,0)    + p_xp_delta),
      creds = greatest(0, coalesce(creds,0) + p_creds_delta)
  where uid = v_uid;
end;
$;

-- create a self-select policy only if it doesn't exist (use different dollar tag)
do $
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='users' and policyname='users self select'
  ) then
    execute 'create policy "users self select" on public.users for select using (auth.uid() = uid)';
  end if;
end
$;

-- realtime publication guard
do $
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='users'
  ) then
    alter publication supabase_realtime add table public.users;
  end if;
end
$;

-- reload PostgREST schema
notify pgrst, 'reload schema';