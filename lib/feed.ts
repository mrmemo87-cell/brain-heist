import { supabase } from '@/lib/supa';

export type FeedItem = {
  kind: 'news' | 'hack';
  id: string;
  ts: string;
  actor: string | null;
  actor_name: string | null;
  actor_avatar_url: string | null;
  target: string | null;
  target_name: string | null;
  target_avatar_url: string | null;
  type: string | null;
  icon: string | null;
  reacts: Record<string, number> | null;
  outcome: 'win' | 'lose' | 'fail' | null;
  amount: number | null;
  xp: number | null;
  coins_awarded: number | null;
  defender_coins_lost: number | null;
  xp_awarded: number | null;
  win_prob: number | null;
  payload: any;
};

type HackRow = {
  id: number;
  attacker: string | null;
  attacker_name: string | null;
  defender: string | null;
  defender_name: string | null;
  outcome: 'win' | 'lose' | 'fail' | null;
  xp_awarded: number | null;
  coins_awarded: number | null;
  defender_coins_lost: number | null;
  win_prob: number | null;
  created_at: string; // timestamptz
};

export async function getFeed(limit = 50): Promise<FeedItem[]> {
  // Prefer the RPC if it exists in your DB
  const { data, error } = await supabase.rpc('hack_feed', { _limit: limit });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as HackRow[];
  return rows.map((r) => ({
    kind: 'hack',
    id: String(r.id),
    ts: r.created_at,
    actor: r.attacker,
    actor_name: r.attacker_name,
    actor_avatar_url: null,
    target: r.defender,
    target_name: r.defender_name,
    target_avatar_url: null,
    type: 'hack_attempt',
    icon: 'swords',
    reacts: null,
    outcome: r.outcome,
    amount: r.coins_awarded ?? null,
    xp: r.xp_awarded ?? null,
    coins_awarded: r.coins_awarded ?? null,
    defender_coins_lost: r.defender_coins_lost ?? null,
    xp_awarded: r.xp_awarded ?? null,
    win_prob: r.win_prob ?? null,
    payload: null,
  }));
}

