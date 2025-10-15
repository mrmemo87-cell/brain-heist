-- fix_users_rls_and_policies.sql
DO $
BEGIN
  -- enable RLS (ignore if already enabled)
  BEGIN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN
    -- table may already be enabled / or not exist yet
    NULL;
  END;

  -- create SELECT policy if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='users' AND policyname='users self select'
  ) THEN
    EXECUTE 'CREATE POLICY "users self select" ON public.users
             FOR SELECT
             USING (auth.uid() = id)';
  END IF;

  -- create UPDATE policy if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='users' AND policyname='users self update'
  ) THEN
    EXECUTE 'CREATE POLICY "users self update" ON public.users
             FOR UPDATE
             USING (auth.uid() = id)
             WITH CHECK (auth.uid() = id)';
  END IF;
END
$;