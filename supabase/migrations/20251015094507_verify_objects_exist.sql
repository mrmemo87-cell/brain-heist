-- verify_objects_exist.sql
DO $
DECLARE
  _ok int;
BEGIN
  -- verify tables
  PERFORM 1 FROM pg_class WHERE relname = 'shop_items' AND relnamespace = 'public'::regnamespace;
  IF NOT FOUND THEN RAISE EXCEPTION 'shop_items missing'; END IF;

  PERFORM 1 FROM pg_class WHERE relname = 'user_inventory' AND relnamespace = 'public'::regnamespace;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_inventory missing'; END IF;

  PERFORM 1 FROM pg_class WHERE relname = 'user_effects' AND relnamespace = 'public'::regnamespace;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_effects missing'; END IF;

  -- verify RPCs
  PERFORM 1 FROM pg_proc
   WHERE pronamespace='public'::regnamespace
     AND proname IN ('rpc_inventory_for_me','rpc_active_effects_for_me','rpc_upgrade_stat','rpc_inventory_activate');
  IF NOT FOUND THEN RAISE EXCEPTION 'one or more RPCs missing'; END IF;

  RAISE NOTICE 'OK: tables and RPCs found';
END
$;