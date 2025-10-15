-- 0002a_rpc_inventory_for_me.sql
CREATE OR REPLACE FUNCTION public.rpc_inventory_for_me()
RETURNS TABLE (
  item_key TEXT,
  name TEXT,
  description TEXT,
  emoji TEXT,
  category TEXT,
  price INT,
  qty INT
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $
  SELECT i.key, i.name, i.description, i.emoji, i.category, i.price, inv.qty
  FROM public.user_inventory inv
  JOIN public.shop_items i ON i.key = inv.item_key
  WHERE inv.user_id = auth.uid()
  ORDER BY i.category, i.price, i.key;
$;

REVOKE ALL ON FUNCTION public.rpc_inventory_for_me() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_inventory_for_me() TO anon, authenticated;