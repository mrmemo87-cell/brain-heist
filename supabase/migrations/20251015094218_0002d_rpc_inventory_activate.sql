-- 0002d_rpc_inventory_activate.sql
CREATE OR REPLACE FUNCTION public.rpc_inventory_activate(p_item_key TEXT)
RETURNS TABLE (effect_id BIGINT, item_key TEXT, ends_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $
DECLARE
  v_uid UUID := auth.uid();
  v_effect JSONB;
  v_minutes INT;
  v_ends TIMESTAMPTZ;
BEGIN
  -- You must be logged in
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Own & have qty
  PERFORM 1 FROM public.user_inventory WHERE user_id = v_uid AND item_key = p_item_key AND qty > 0;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'You do not own this item or qty is zero';
  END IF;

  -- Effect template
  SELECT effect INTO v_effect FROM public.shop_items WHERE key = p_item_key;
  IF v_effect IS NULL OR v_effect = '{}'::jsonb THEN
    RAISE EXCEPTION 'Item has no activatable effect';
  END IF;

  v_minutes := COALESCE((v_effect->>'duration_minutes')::int, 0);
  IF v_minutes <= 0 THEN
    RAISE EXCEPTION 'Invalid or missing duration_minutes in effect metadata';
  END IF;

  v_ends := now() + make_interval(mins => v_minutes);

  -- Consume one
  UPDATE public.user_inventory
     SET qty = qty - 1
   WHERE user_id = v_uid AND item_key = p_item_key;

  -- Record effect snapshot
  INSERT INTO public.user_effects(user_id, item_key, effect, ends_at)
  VALUES (v_uid, p_item_key, v_effect, v_ends)
  RETURNING id, item_key, ends_at
  INTO effect_id, item_key, ends_at;

  RETURN NEXT;
END
$;

REVOKE ALL ON FUNCTION public.rpc_inventory_activate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_inventory_activate(TEXT) TO authenticated;