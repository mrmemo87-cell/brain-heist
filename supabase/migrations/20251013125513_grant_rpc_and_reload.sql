-- PostgREST schema reload + RPC grants (idempotent)

-- ? correct quoting for pg_notify
DO $r$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END
$r$;

-- ? make sure your RPCs are callable (no-op if already granted)
GRANT EXECUTE ON FUNCTION public.rpc_inventory_for_me() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_active_effects_for_me() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_upgrade_stat(TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_inventory_activate(TEXT) TO authenticated;