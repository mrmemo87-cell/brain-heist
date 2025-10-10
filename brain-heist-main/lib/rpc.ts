'use client';
import { supabase } from './supabaseClient';

/*
 * Generic RPC helper.
 * Note: We don't pass a generic to supabase.rpc() directly to avoid TS mismatch across SDK versions.
 */
export async function rpc<T = any>(fn: string, args?: Record<string, any>) {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  if (error) throw new Error(error.message);
  return data as T;
}

export const api = {
  touchLogin: () => rpc('rpc_touch_daily_login'),
  tasksBootstrap: () => rpc('rpc_tasks_bootstrap_for_me'),
  tasksList: () => rpc('rpc_tasks_list'),
  taskSubmit: (id: number, inc = 1) => rpc('rpc_task_submit', { _user_task_id: id, _inc: inc }),
  taskClaim: (id: number) => rpc('rpc_task_claim', { _user_task_id: id }),
  shopList: () => rpc('rpc_shop_list'),
  shopBuy: (itemId: number) => rpc('rpc_shop_buy', { _item_id: itemId }),
  activateItem: (key: string) => rpc('rpc_activate_item', { _item_key: key }),
  profileMe: () => rpc('rpc_profile_me'),
  equipFlair: (key: string) => rpc('rpc_equip_flair', { _item_key: key }),
  unequipFlair: () => rpc('rpc_unequip_flair'),
  hackAttempt: (defenderUuid: string) => rpc('rpc_hack_attempt', { _def: defenderUuid }),
  leaderboard: (scope: 'batch' | 'global', batch?: string, limit = 10) =>
    rpc('rpc_leaderboard', { _scope: scope, _batch: batch ?? null, _limit: limit }),
   upgradeCosts: () => rpc('rpc_upgrade_costs'),
  upgradeHack: (steps = 1) => rpc('rpc_upgrade_hack', { _steps: steps }),
  upgradeSecurity: (steps = 1) => rpc('rpc_upgrade_security', { _steps: steps }),
};
