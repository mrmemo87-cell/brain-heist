// lib/api.ts
import supabase from '@/lib/supabaseClient.client';

export type UUID = string;

export type HackFeedRow = {
  id: number;
  ts: string;
  attacker_id: UUID | null;
  attacker_name?: string | null;
  attacker_avatar_url?: string | null;
  defender_id: UUID | null;
  defender_name?: string | null;
  defender_avatar_url?: string | null;
  outcome?: string | null;
  coins_awarded?: number;
  defender_coins_lost?: number;
  xp_awarded?: number;
  win_prob?: number;
};

export type HackAttemptResult = {
  ok?: boolean;
  result?: 'win' | 'lose' | 'shielded' | string;
  win_prob?: number;
  rand?: number;
  coins_stolen?: number;
  attacker_coins?: number;
  target_coins?: number;
  attacker_stamina?: number;
  [k: string]: any;
};

export async function rpcInventoryForMe() {
  const { data, error } = await supabase.rpc('rpc_inventory_for_me');
  if (error) throw error;
  return data;
}

export async function rpcActiveEffectsForMe() {
  const { data, error } = await supabase.rpc('rpc_active_effects_for_me');
  if (error) throw error;
  return data;
}

export async function rpcInventoryActivate(item_key: string) {
  const { data, error } = await supabase.rpc('rpc_inventory_activate', { p_item_key: item_key });
  if (error) throw error;
  return data;
}

export async function rpcShopList() {
  const { data, error } = await supabase.rpc('rpc_shop_list');
  if (error) throw error;
  return data;
}

export async function rpcShopBuy(item_key: string) {
  const { data, error } = await supabase.rpc('rpc_shop_buy', { p_item_key: item_key });
  if (error) throw error;
  return data;
}

export async function rpcHackFeed(limit = 20) {
  const { data, error } = await supabase.rpc('rpc_hack_feed', { limit_n: limit });
  if (error) throw error;
  return data as HackFeedRow[];
}

export async function rpcHackEmulate(target: UUID) {
  const { data, error } = await supabase.rpc('rpc_hack_attempt_emulate', { p_target: target });
  if (error) throw error;
  return data as HackAttemptResult;
}

export async function rpcHackAttempt(target: UUID) {
  const { data, error } = await supabase.rpc('rpc_hack_attempt', { p_target: target });
  if (error) throw error;
  return data as HackAttemptResult;
}

export async function rpcUpgradeStat(stat: string, amount = 1) {
  const { data, error } = await supabase.rpc('rpc_upgrade_stat', { target: stat, amount });
  if (error) throw error;
  return data;
}
