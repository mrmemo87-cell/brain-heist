-- atomic increment of xp/creds for the signed-in user
create or replace function public.rpc_inc_user_stats(dxp integer, dcreds integer)
returns table (xp bigint, creds bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_xp bigint;
  new_creds bigint;
begin
  update public.users
  set xp    = coalesce(xp,0)    + coalesce(dxp,0),
      creds = coalesce(creds,0) + coalesce(dcreds,0)
  where uid = auth.uid()
  returning xp, creds into new_xp, new_creds;

  return query select new_xp, new_creds;
end;
$$;

grant execute on function public.rpc_inc_user_stats(integer, integer) to authenticated;
