-- Create a simple table for active inventory effects (idempotent)
create table if not exists public.inventory_effects (
  id               bigserial primary key,
  uid              uuid not null references auth.users(id) on delete cascade,
  item_key         text not null,
  effect           text not null default '',
  duration_seconds integer not null default 0,
  started_at       timestamptz not null default now(),
  expires_at       timestamptz,
  unique(uid, item_key)
);

-- Enable RLS and policies (idempotent)
alter table public.inventory_effects enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory_effects' and policyname='inventory_effects self read'
  ) then
    execute $$create policy "inventory_effects self read"
      on public.inventory_effects for select
      to authenticated
      using (uid = auth.uid())$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory_effects' and policyname='inventory_effects self write'
  ) then
    execute $$create policy "inventory_effects self write"
      on public.inventory_effects for all
      to authenticated
      using (uid = auth.uid())
      with check (uid = auth.uid())$$;
  end if;
end $$;

-- RPC: activate or refresh an item for the signed-in user
create or replace function public.rpc_inventory_activate(
  p_item_key text,
  p_duration_seconds integer default 1800,
  p_effect text default ''
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $fn$
declare
  v_uid uuid := auth.uid();
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'auth.uid() is null' using errcode = '42501';
  end if;

  v_expires := now() + make_interval(secs => greatest(0, coalesce(p_duration_seconds,0)));

  insert into public.inventory_effects(uid, item_key, effect, duration_seconds, started_at, expires_at)
  values (v_uid, p_item_key, coalesce(p_effect,''), greatest(0, coalesce(p_duration_seconds,0)), now(), v_expires)
  on conflict (uid, item_key) do update
  set effect           = excluded.effect,
      duration_seconds = excluded.duration_seconds,
      started_at       = now(),
      expires_at       = excluded.expires_at;
end;
$fn$;

revoke all on function public.rpc_inventory_activate(text, integer, text) from public;
grant execute on function public.rpc_inventory_activate(text, integer, text) to authenticated, anon;

-- RPC: list active effects for me (shape matches the UI)
create or replace function public.rpc_active_effects_for_me()
returns table (
  id bigint,
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
    ie.id, ie.item_key, ie.effect, ie.started_at, ie.expires_at, ie.duration_seconds
  from public.inventory_effects ie
  where ie.uid = auth.uid()
    and (ie.expires_at is null or ie.expires_at > now())
  order by coalesce(ie.expires_at, now() + interval '100 years') asc;
$$;

revoke all on function public.rpc_active_effects_for_me() from public;
grant execute on function public.rpc_active_effects_for_me() to authenticated, anon;

-- Nudge PostgREST to pick up functions
do $$ begin
  perform pg_notify('pgrst','reload schema');
end $$;