-- 0002b_rpc_active_effects_for_me.sql
CREATE OR REPLACE FUNCTION public.rpc_active_effects_for_me()
RETURNS TABLE (
  id BIGINT,
  item_key TEXT,
  effect JSONB,
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  remaining_seconds INT
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $
  SELECT e.id, e.item_key, e.effect, e.started_at, e.ends_at,
         GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (e.ends_at - now())))::int) AS remaining_seconds
  FROM public.user_effects e
  WHERE e.user_id = auth.uid() AND now() < e.ends_at
  ORDER BY e.ends_at;
$;

REVOKE ALL ON FUNCTION public.rpc_active_effects_for_me() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_active_effects_for_me() TO anon, authenticated;