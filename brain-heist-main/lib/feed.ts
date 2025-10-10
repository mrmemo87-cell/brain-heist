import { supabase } from '@/lib/supa';

export type FeedItem = {
  kind: 'news' | 'hack'; id: string; ts: string;
  actor: string | null; actor_name: string | null; actor_avatar_url: string | null;
  target: string | null; target_name: string | null; target_avatar_url: string | null;
  type: string | null; icon: string | null; reacts: Record<string, number> | null;
  outcome: 'win' | 'lose' | 'fail' | null; amount: number | null; xp: number | null;
  coins_awarded: number | null; defender_coins_lost: number | null;
  xp_awarded: number | null; win_prob: number | null; payload: any;
};

export async function getFeed(limit = 50) {
  const supa = supabase;
  if (error) throw error;
  return data as FeedItem[];
}
