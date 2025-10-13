-- allow authenticated clients to call the RPC
GRANT EXECUTE ON FUNCTION public.rpc_inc_user_stats(integer, integer) TO authenticated;

-- force PostgREST to pick up latest functions/policies
DO $$ BEGIN
  PERFORM pg_notify(''pgrst'', ''reload schema'');
END $$;