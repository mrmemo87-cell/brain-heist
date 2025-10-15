-- === Fix permissions ===
grant select on public.shop_items to anon, authenticated;
grant select on public.shop_items_base to anon, authenticated;

-- (Inventory is RLS’d; selects go through policy, so just ensure SELECT on table exists too)
grant select, insert, update, delete on public.inventory to authenticated;

-- Recreate rpc_inventory_for_me with clearer error if auth.uid() is null
drop function if exists public.rpc_inventory_for_me();

create function public.rpc_inventory_for_me()
returns table (
  item_key text,
  qty integer,
  started_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated (auth.uid() is null)' using errcode = '42501';
  end if;

  return query
  select i.item_key, i.qty, i.started_at, i.expires_at
  from public.inventory i
  where i.uid = v_uid;
end;
$fn$;

revoke all on function public.rpc_inventory_for_me() from public;
grant execute on function public.rpc_inventory_for_me() to anon, authenticated;

-- Make the active-effects RPC also error nicely if unauthenticated
drop function if exists public.rpc_active_effects_for_me();

create function public.rpc_active_effects_for_me()
returns table (
  id bigint,
  item_key text,
  effect text,
  started_at timestamptz,
  expires_at timestamptz,
  duration_seconds integer
)
language plpgsql
security definer
set search_path = public, auth
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated (auth.uid() is null)' using errcode = '42501';
  end if;

  return query
  select
    row_number() over (order by i.started_at nulls last)::bigint as id,
    i.item_key,
    concat('Effect of ', i.item_key) as effect,
    i.started_at,
    i.expires_at,
    case when i.started_at is not null and i.expires_at is not null
         then greatest(0, extract(epoch from (i.expires_at - i.started_at)))::int
         else 0 end as duration_seconds
  from public.inventory i
  where i.uid = v_uid
    and i.expires_at is not null
    and i.expires_at > now();
end;
$fn$;

revoke all on function public.rpc_active_effects_for_me() from public;
grant execute on function public.rpc_active_effects_for_me() to anon, authenticated;

-- === Seed a few shop items (idempotent upserts) ===
insert into public.shop_items_base as b (key,name,description,price,category,emoji) values
  ('boost_xp_small','Small XP Boost','+10% XP for 10m',100,'boost','⚡'),
  ('shield_basic','Basic Shield','Reduce penalties for 10m',150,'defense','🛡️'),
  ('hack_toolkit','Hack Toolkit','+1 hacking level temporarily',200,'attack','🗡️')
on conflict (key) do update
set name=excluded.name,
    description=excluded.description,
    price=excluded.price,
    category=excluded.category,
    emoji=excluded.emoji;

-- === Seed one inventory row for the signed-in user (when called from SQL console it’ll be null; from app it will work) ===
do $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is not null then
    insert into public.inventory(uid, item_key, qty)
    values (v_uid, 'boost_xp_small', 1)
    on conflict (uid, item_key) do update set qty = public.inventory.qty;
  end if;
end $$;

-- Reload PostgREST cache
do $$ begin
  perform pg_notify('pgrst','reload schema');
end $$;