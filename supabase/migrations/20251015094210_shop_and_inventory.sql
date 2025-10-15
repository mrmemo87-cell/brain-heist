-- 0001_shop_and_inventory.sql

-- USERS: we assume you already have public.users(id uuid primary key, xp int, credits int, security int).
-- If columns might be missing, uncomment these:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS xp int DEFAULT 0;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits int DEFAULT 0;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security int DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.shop_items (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INT NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'consumable', -- simpler than ENUM
  emoji TEXT DEFAULT '??',
  effect JSONB DEFAULT '{}'::jsonb,           -- e.g. {"type":"shield","duration_minutes":60,"power":30}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_inventory (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL REFERENCES public.shop_items(key) ON DELETE RESTRICT,
  qty INT NOT NULL DEFAULT 0 CHECK (qty >= 0),
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_key)
);

CREATE TABLE IF NOT EXISTS public.user_effects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL REFERENCES public.shop_items(key) ON DELETE RESTRICT,
  effect JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  consumed_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_effects_user_active
  ON public.user_effects(user_id, ends_at) WHERE (now() < ends_at);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user
  ON public.user_inventory(user_id);

-- Enable RLS (no-op if already enabled)
DO }
BEGIN
  BEGIN
    ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER TABLE public.user_effects ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN others THEN NULL; END;
END};

-- Policies (create if missing)
DO }
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='shop_items' AND policyname='shop_items_read_all'
  ) THEN
    CREATE POLICY shop_items_read_all ON public.shop_items
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_inventory' AND policyname='user_inventory_self_rw'
  ) THEN
    CREATE POLICY user_inventory_self_rw ON public.user_inventory
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_effects' AND policyname='user_effects_self_rw'
  ) THEN
    CREATE POLICY user_effects_self_rw ON public.user_effects
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END};