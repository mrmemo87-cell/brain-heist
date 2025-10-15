-- seed_test_inventory.sql
-- replace YOUR_UUID once; commit; later you can delete this file or leave it (idempotent-ish with ON CONFLICT)
DO $
DECLARE
  _uid uuid := 'YOUR_UUID_HERE';
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Set YOUR_UUID_HERE to your auth user id';
  END IF;

  INSERT INTO public.user_inventory(user_id,item_key,qty)
  VALUES (_uid,'shield_basic',2)
  ON CONFLICT (user_id,item_key)
  DO UPDATE SET qty = public.user_inventory.qty + EXCLUDED.qty;
END
$;