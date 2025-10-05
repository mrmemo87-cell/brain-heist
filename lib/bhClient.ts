// lib/bhClient.ts
import { createClient } from "@supabase/supabase-js";

export type BHClient = ReturnType<typeof makeBHClient>;

export function makeBHClient(supabaseUrl: string, supabaseAnonKey: string, options?: any) {
  const sb = createClient(supabaseUrl, supabaseAnonKey, options);

  const rpc = {
    // === existing, from your contract ===
    rpc_touch_daily_login: () => sb.rpc("rpc_touch_daily_login"),
    rpc_tasks_bootstrap_for_me: () => sb.rpc("rpc_tasks_bootstrap_for_me"),
    rpc_tasks_list: () => sb.rpc("rpc_tasks_list"),
    rpc_task_question: (_user_task_id: number) => sb.rpc("rpc_task_question", { _user_task_id }),
    rpc_task_answer: (_user_task_id: number, _question_id: number, _choice_index: number) =>
      sb.rpc("rpc_task_answer", { _user_task_id, _question_id, _choice_index }),
    rpc_shop_list: () => sb.rpc("rpc_shop_list"),
    rpc_shop_buy: (_item_id: number) => sb.rpc("rpc_shop_buy", { _item_id }),
    rpc_activate_item: (_item_key: string) => sb.rpc("rpc_activate_item", { _item_key }),
    rpc_inventory: () => sb.rpc("rpc_inventory"),
    rpc_equip_flair: (_item_key: string) => sb.rpc("rpc_equip_flair", { _item_key }),
    rpc_unequip_flair: () => sb.rpc("rpc_unequip_flair"),
    rpc_profile_me: () => sb.rpc("rpc_profile_me"),
    rpc_leaderboard: (_scope: string, _batch: string, _limit: number) =>
      sb.rpc("rpc_leaderboard", { _scope, _batch, _limit }),
    rpc_hack_attempt: (_def: string) => sb.rpc("rpc_hack_attempt", { _def }),
    rpc_hack_feed: (_limit: number) => sb.rpc("rpc_hack_feed", { _limit }),
    rpc_upgrade_costs: () => sb.rpc("rpc_upgrade_costs"),
    rpc_upgrade_hack: (_steps: number) => sb.rpc("rpc_upgrade_hack", { _steps }),
    rpc_upgrade_security: (_steps: number) => sb.rpc("rpc_upgrade_security", { _steps }),
    rpc_open_loot: (_choice: number) => sb.rpc("rpc_open_loot", { _choice }),

    // === NEW: settings + cooldown ===
    rpc_settings_get: (_keys?: string[] | null) => sb.rpc("rpc_settings_get", { _keys: _keys ?? null }),
    rpc_hack_cooldown: (_def: string) => sb.rpc("rpc_hack_cooldown", { _def }),
  };

  async function unwrap<T>(p: Promise<{ data: T; error: any }>): Promise<T> {
    const { data, error } = await p;
    if (error) throw error;
    return data;
  }

  return { sb, rpc, unwrap };
}
