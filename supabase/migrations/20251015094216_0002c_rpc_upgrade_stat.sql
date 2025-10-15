-- 0002c_rpc_upgrade_stat.sql
CREATE OR REPLACE FUNCTION public.rpc_upgrade_stat(target TEXT, amount INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $
DECLARE col TEXT;
BEGIN
  IF target NOT IN ('xp','credits','security') THEN
    RAISE EXCEPTION 'Invalid target. Use xp, credits, or security';
  END IF;

  col := quote_ident(target);
  EXECUTE format(
    'UPDATE public.users SET %I = GREATEST(0, COALESCE(%I,0) + ) WHERE id = auth.uid()',
    col, col
  ) USING amount;
END
$;

REVOKE ALL ON FUNCTION public.rpc_upgrade_stat(TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_upgrade_stat(TEXT, INT) TO authenticated, anon;