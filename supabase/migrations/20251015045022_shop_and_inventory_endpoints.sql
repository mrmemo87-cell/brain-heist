-- 1) Base table for items (idempotent)
create table if not exists public.shop_items_base (
  key text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  category text not null,
  emoji text
);

-- 2) View exactly as the frontend queries (has "desc")
create or replace view public.shop_items as
select
  b.key,
  b.name,
  b.description as "desc",
  b.price,
  b.category,
  b.emoji
from public.shop_items_base b;

grant usage on schema public to anon, authenticated;
grant select on public.shop_items to anon, authenticated;

-- 3) Minimal seed (safe idempotent)
insert into public.shop_items_base(key,name,description,price,category,emoji) values
  ('boost_xp_small','Small XP Boost','+10% XP for 10m',100,'boost','⚡'),
  ('shield_basic','Basic Shield','Reduce penalties for 10m',150,'defense','🛡️'),
  ('hack_toolkit','Hack Toolkit','+1 hacking level temporarily',200,'attack','🗡️')
on conflict (key) do update
set name=excluded.name,
    description=excluded.description,
    price=excluded.price,
    category=excluded.category,
    emoji=excluded.emoji;

-- 4) Safe stub for rpc_inventory_for_me(): no args, returns expected columns
--    This returns an EMPTY set (no rows) so the UI gets HTTP 200 []
create or replace function public.rpc_inventory_for_me()
returns table (
  id integer,
  item_key text,
  effect text,
  started_at timestamptz,
  expires_at timestamptz,
  duration_seconds integer
)
language sql
security definer
set search_path = public, auth
as $$
  -- Replace later with a real SELECT from your inventory tables.
  -- For now: return zero rows (WHERE false).
  select
    null::integer      as id,
    null::text         as item_key,
    null::text         as effect,
    now()              as started_at,
    null::timestamptz  as expires_at,
    0::integer         as duration_seconds
  where false;
$$;

revoke all on function public.rpc_inventory_for_me() from public;
grant execute on function public.rpc_inventory_for_me() to anon, authenticated;

-- 5) Reload PostgREST
do $$ begin perform pg_notify('pgrst','reload schema'); end $$;