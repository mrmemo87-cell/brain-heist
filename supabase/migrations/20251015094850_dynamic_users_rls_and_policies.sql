-- dynamic_users_rls_and_policies.sql
-- Detects the single-column PK of public.users and (re)creates self select/update policies

DO $pol$
DECLARE
  pkcol text;
  pol_select text := 'users self select';
  pol_update text := 'users self update';
BEGIN
  -- find single-column PK name for public.users
  SELECT a.attname INTO pkcol
  FROM   pg_index i
  JOIN   pg_class c ON c.oid = i.indrelid
  JOIN   pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
  WHERE  c.relname = 'users'
    AND  c.relnamespace = 'public'::regnamespace
    AND  i.indisprimary = true
  GROUP BY a.attname
  HAVING count(*) = 1
  LIMIT 1;

  IF pkcol IS NULL THEN
    RAISE EXCEPTION 'Could not detect a single-column primary key on public.users';
  END IF;

  -- enable RLS (ignore if already enabled)
  BEGIN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN
    NULL;
  END;

  -- drop old/broken policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='users' AND policyname=pol_select
  ) THEN
    EXECUTE format('DROP POLICY "%s" ON public.users', pol_select);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='users' AND policyname=pol_update
  ) THEN
    EXECUTE format('DROP POLICY "%s" ON public.users', pol_update);
  END IF;

  -- create fresh policies using the detected PK column
  EXECUTE format(
    'CREATE POLICY "%s" ON public.users FOR SELECT USING (auth.uid() = %I)',
    pol_select, pkcol
  );

  EXECUTE format(
    'CREATE POLICY "%s" ON public.users FOR UPDATE USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)',
    pol_update, pkcol, pkcol
  );

  RAISE NOTICE 'Users RLS policies created with PK column: %', pkcol;
END
$pol$;