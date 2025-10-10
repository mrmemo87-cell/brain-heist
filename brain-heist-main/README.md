BRAIN HEIST — DB CONTRACT (stable names)

Tables (key columns only):
- public.profiles(user_id uuid PK, username text, batch text, xp_total int, coins_balance int,
  streak_days int, hack_skill int, security_level int, loot_tokens int, flair_item_id bigint null)
- public.items(id bigserial PK, key text unique, name text, price_effective int)
- public.inventory(user_id uuid, item_id bigint, qty int, primary key(user_id,item_id))
- public.tasks_def(id bigserial PK, kind text, code text, title text, target_int int, ...)
- public.user_tasks(id bigserial PK, user_id uuid, task_id bigint, period_key text/date, progress int, completed bool, claimed bool)
- public.questions(id bigserial PK, batch text null, subject text, difficulty int, prompt text, choices text[], correct_index int)
- public.hack_attempts(id bigserial PK, attacker uuid, defender uuid, outcome text, xp_awarded int, coins_awarded int, defender_coins_lost int, win_prob numeric, attacker_hack_skill int, defender_security_level int, created_at timestamptz)

RPCs (name + args → returns):
- rpc_touch_daily_login() → void
- rpc_tasks_bootstrap_for_me() → void
- rpc_tasks_list() → (id bigint, kind text, code text, title text, description text, target_int int, progress int, completed bool, claimed bool, period_key text)
- rpc_task_question(_user_task_id bigint) → (id bigint, prompt text, choices text[])
- rpc_task_answer(_user_task_id bigint, _question_id bigint, _choice_index int) → (correct bool, delta int, progress int, target int, loot_awarded bool, penalty text)
- rpc_shop_list() → (...)
- rpc_shop_buy(_item_id bigint) → (...)
- rpc_activate_item(_item_key text) → (...)
- rpc_inventory() → (item_id bigint, key text, name text, qty int, kind text)
- rpc_equip_flair(_item_key text) → (...)
- rpc_unequip_flair() → (...)
- rpc_profile_me() → (...)
- rpc_leaderboard(_scope text, _batch text, _limit int) → (...)
- rpc_hack_attempt(_def uuid) → (outcome text, xp_awarded int, coins_awarded int, defender_coins_lost int, win_prob numeric)
- rpc_hack_feed(_limit int) → (id bigint, attacker uuid, attacker_name text, defender uuid, defender_name text, outcome text, xp_awarded int, coins_awarded int, defender_coins_lost int, win_prob numeric, created_at timestamptz)
- rpc_upgrade_costs() → (hack_level int, security_level int, coins_balance int, hack_next_cost int, security_next_cost int, hack_cap int, security_cap int)
- rpc_upgrade_hack(_steps int) → (new_level int, coins_spent int, levels_gained int)
- rpc_upgrade_security(_steps int) → (new_level int, coins_spent int, levels_gained int)
- rpc_open_loot(_choice int) → (kind text, amount int, item_key text)
