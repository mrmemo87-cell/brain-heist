-- === shop_items base table (use "description" not reserved "desc") ===
create table if not exists public.shop_items_base (
  key        text primary key,
  name       text not null,
  description text not null default '',
  price      integer not null check (price >= 0),
  category   text not null default 'general',
  emoji      text not null default '🛒',
  created_at timestamptz not null default now()
);

-- View exposing legacy column name "desc" so frontend code keeps working
drop view if exists public.shop_items cascade;
create view public.shop_items as
select
  key,
  name,
  description as "desc",
  price,
  category,
  emoji
from public.shop_items_base;

-- === inventory table (very small model to unblock UI) ===
create table if not exists public.inventory (
  uid         uuid not null references public.users(uid) on delete cascade,
  item_key    text not null references public.shop_items_base(key) on delete cascade,
  qty         integer not null default 0 check (qty >= 0),
  started_at  timestamptz,
  expires_at  timestamptz,
  constraint inventory_pkey primary key (uid, item_key)
);

-- Helpful index for actives
create index if not exists idx_inventory_active on public.inventory(uid, expires_at) where expires_at is not null;

-- === RLS & policies ===
alter table public.shop_items_base enable row level security;
alter table public.inventory       enable row level security;

-- Read-only to everyone (shop catalog)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='shop_items_base' and policyname='shop_items_base read all'
  ) then
    execute 'create policy "shop_items_base read all" on public.shop_items_base for select to anon, authenticated using (true)';
  end if;
end $$;

-- Inventory: each user reads & writes only their rows
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory' and policyname='inventory self select'
  ) then
    execute 'create policy "inventory self select" on public.inventory for select to authenticated using (uid = auth.uid())';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory' and policyname='inventory self upsert'
  ) then
    execute 'create policy "inventory self upsert" on public.inventory for insert to authenticated with check (uid = auth.uid())';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory' and policyname='inventory self update'
  ) then
    execute 'create policy "inventory self update" on public.inventory for update to authenticated using (uid = auth.uid()) with check (uid = auth.uid())';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory' and policyname='inventory self delete'
  ) then
    execute 'create policy "inventory self delete" on public.inventory for delete to authenticated using (uid = auth.uid())';
  end if;
end $$;

-- === RPCs expected by the app ===

-- 1) Inventory for me
drop function if exists public.rpc_inventory_for_me();
create function public.rpc_inventory_for_me()
returns table (
  item_key text,
  qty integer,
  started_at timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select i.item_key, i.qty, i.started_at, i.expires_at
  from public.inventory i
  where i.uid = auth.uid()
$$;

revoke all on function public.rpc_inventory_for_me() from public;
grant execute on function public.rpc_inventory_for_me() to anon, authenticated;

-- 2) Active effects for me (used by profile page)
drop function if exists public.rpc_active_effects_for_me();
create function public.rpc_active_effects_for_me()
returns table (
  id bigserial,
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
  select
    -- fabricate an id from row_number so UI has a key
    row_number() over (order by i.started_at nulls last) as id,
    i.item_key,
    concat('Effect of ', i.item_key) as effect,
    i.started_at,
    i.expires_at,
    case
      when i.started_at is not null and i.expires_at is not null
        then greatest(0, extract(epoch from (i.expires_at - i.started_at)))::int
      else 0
    end as duration_seconds
  from public.inventory i
  where i.uid = auth.uid()
    and i.expires_at is not null
    and i.expires_at > now()
$$;

revoke all on function public.rpc_active_effects_for_me() from public;
grant execute on function public.rpc_active_effects_for_me() to anon, authenticated;

-- (Optional) expose the realtime publication if not yet
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename in ('inventory','shop_items_base')
  ) then
    begin
      execute 'alter publication supabase_realtime add table public.inventory';
    exception when others then null;
    end;
    begin
      execute 'alter publication supabase_realtime add table public.shop_items_base';
    exception when others then null;
    end;
  end if;
end $$;

-- Reload PostgREST schema cache
do $$ begin
  perform pg_notify('pgrst','reload schema');
end $$;