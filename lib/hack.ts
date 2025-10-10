import { supabase } from '@/lib/supa';

export type HackOutcome = 'win' | 'lose' | 'fail';
export type HackAttemptResult = {
  outcome: HackOutcome;
  xp_awarded: number;
  coins_awarded: number;
  defender_coins_lost: number;
  win_prob: number;
};

export async function hackAttempt(defenderUid: string): Promise<HackAttemptResult> {
  const supa = supabase;
  const { data, error } = await supabase.rpc('rpc_hack_attempt', { _def: defenderUid });
  if (error) throw new Error(error.message);

  // Supabase RPCs sometimes return [row] or row — normalize it
  const row: any = Array.isArray(data) ? data[0] : data;

  const fallback: HackAttemptResult = {
    outcome: 'fail',
    xp_awarded: 0,
    coins_awarded: 0,
    defender_coins_lost: 0,
    win_prob: 0,
  };

  if (!row || typeof row !== 'object') return fallback;

  return {
    outcome: (row.outcome as HackOutcome) ?? 'fail',
    xp_awarded: Number(row.xp_awarded ?? 0),
    coins_awarded: Number(row.coins_awarded ?? 0),
    defender_coins_lost: Number(row.defender_coins_lost ?? 0),
    win_prob: Number(row.win_prob ?? 0),
  };
}
