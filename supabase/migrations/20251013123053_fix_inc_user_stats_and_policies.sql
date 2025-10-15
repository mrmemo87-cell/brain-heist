-- fix users RLS + self policies (dynamic PK)
DO $pol$
DECLARE
  pkcol text;
BEGIN
  -- detect single-column PK of public.users
  SELECT a.attname INTO pkcol
  FROM   pg_index i
  JOIN   pg_class c ON c.oid = i.indrelid
  JOIN   pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
  WHERE  c.relname = 'users'
    AND  c.relnamespace = 'public'::regnamespace
    AND  i.indisprimary
  GROUP BY a.attname
  HAVING count(*) = 1
  LIMIT 1;

  IF pkcol IS NULL THEN
    RAISE EXCEPTION 'public.users must have a single-column primary key';
  END IF;

  -- enable RLS (no-op if already)
  BEGIN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN NULL;
  END;

  -- drop any old/broken versions (names seen in your history)
  BEGIN EXECUTE 'DROP POLICY "users self select" ON public.users'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "users self update self fields" ON public.users'; EXCEPTION WHEN others THEN NULL; END;

  -- create fresh policies (no TO clause)
  EXECUTE format(
    'CREATE POLICY "users self select" ON public.users FOR SELECT USING (auth.uid() = %I)',
    pkcol
  );
  EXECUTE format(
    'CREATE POLICY "users self update self fields" ON public.users FOR UPDATE USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)',
    pkcol, pkcol
  );

  RAISE NOTICE 'Users RLS policies re-created using PK column: %', pkcol;
END
$pol$;