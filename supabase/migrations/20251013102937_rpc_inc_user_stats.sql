-- rpc: increment/decrement xp & creds for the signed-in user
create or replace function public.rpc_inc_user_stats(
  p_xp_delta integer default 0,
  p_creds_delta integer default 0
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $fn$
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
$fn$;

grant execute on function public.rpc_inc_user_stats(integer, integer) to anon, authenticated;

alter table public.users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='users' and policyname='users self select'
  ) then
    execute $$create policy "users self select"
      on public.users for select to authenticated
      using (uid = auth.uid())$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='users' and policyname='users self update xp/creds'
  ) then
    execute $$create policy "users self update xp/creds"
      on public.users for update to authenticated
      using (uid = auth.uid())
      with check (uid = auth.uid())$$;
  end if;
end$$;

-- refresh PostgREST schema cache so RPC is callable immediately
notify pgrst, 'reload schema';