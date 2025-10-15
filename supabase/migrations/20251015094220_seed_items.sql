-- 0003_seed_items.sql
INSERT INTO public.shop_items(key, name, description, price, category, emoji, effect)
VALUES
 ('shield_basic','Shield','Blocks hacks for 60m',150,'consumable','???','{"type":"shield","duration_minutes":60,"power":30}'),
 ('booster_small','XP Booster','2x XP for 30m',250,'booster','?','{"type":"booster","duration_minutes":30,"multiplier":2.0}'),
 ('cracker','Shield Cracker','Breaks one shield on next hack',200,'consumable','??','{"type":"cracker","duration_minutes":10,"charges":1}')
ON CONFLICT (key) DO NOTHING;