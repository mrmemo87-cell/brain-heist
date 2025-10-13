-- rpc_profile_public: show public info from public.users + auth.users email
create or replace function public.rpc_profile_public(p_uid uuid)
returns table (
  uid uuid,
  name text,
  bio text,
  rank int,
  xp int,
  creds int,
  hack_level int,
  sec_level int
)
language sql
security definer
set search_path = public, auth
as $$
  select
    u.uid,
    coalesce(split_part(au.email, '@', 1), 'player') as name,
    ''::text as bio,
    u.rank, u.xp, u.creds, u.hack_level, u.sec_level
  from public.users u
  left join auth.users au on au.id = u.uid
  where u.uid = p_uid
  limit 1;
$$;

revoke all on function public.rpc_profile_public(uuid) from public;
grant execute on function public.rpc_profile_public(uuid) to anon, authenticated;

notify pgrst, 'reload schema';