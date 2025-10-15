-- Base table (idempotent) — adjust if your real base differs
create table if not exists public.shop_items_base (
  key text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  category text not null,
  emoji text
);

-- View with EXACT columns the frontend asks for (desc alias)
create or replace view public.shop_items as
select
  b.key,
  b.name,
  b.description as "desc",
  b.price,
  b.category,
  b.emoji
from public.shop_items_base b;

-- Permissions
grant usage on schema public to anon, authenticated;
grant select on public.shop_items to anon, authenticated;

-- (Optional) seed a couple of items
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

-- Reload PostgREST
do $$ begin perform pg_notify('pgrst','reload schema'); end $$;