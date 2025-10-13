import React from 'react';

type FeedItem = {
  kind: 'news' | 'hack'; id: string; ts: string;
  actor: string | null; actor_name: string | null; actor_avatar_url: string | null;
  target: string | null; target_name: string | null; target_avatar_url: string | null;
  type: string | null; icon: string | null; reacts: Record<string, number> | null;
  outcome: 'win' | 'lose' | 'fail' | null; amount: number | null; xp: number | null;
  coins_awarded: number | null; defender_coins_lost: number | null;
  xp_awarded: number | null; win_prob: number | null; payload: any;
};

export default function FeedCard({ it }: { it: FeedItem }) {
  const time = new Date(it.ts).toLocaleTimeString();

  if (it.kind === 'news') {
    return (
      <div className="rounded-2xl p-3 bg-[var(--c-card)]/70 shadow">
        <div className="flex items-center gap-2 text-xs opacity-80">
          <span>{it.icon ?? 'рџџ¦'}</span>
          <span className="uppercase tracking-wide">{it.type ?? 'EVENT'}</span>
          <span className="ml-auto">{time}</span>
        </div>
        <div className="mt-1 text-xs">
          <b>{it.actor_name ?? 'вЂ”'}</b> в†’ {it.target_name ?? 'вЂ”'}
        </div>
        {(it.amount != null || it.xp != null) && (
          <div className="mt-1 text-xs">
            {it.amount != null && <span className="mr-3">рџ’° {it.amount}</span>}
            {it.xp != null && <span>вњЁ {it.xp}</span>}
          </div>
        )}
      </div>
    );
  }

  const outcomeClass =
    it.outcome === 'win' ? 'text-[var(--c-win)]' :
    it.outcome === 'lose' ? 'text-[var(--c-fail)]' : 'opacity-80';

  return (
    <div className="rounded-2xl p-3 bg-[var(--c-card)]/70 shadow">
      <div className="flex items-center gap-2 text-xs">
        <span className={`uppercase tracking-wide ${outcomeClass}`}>
          {it.outcome ?? 'вЂ”'}
        </span>
        <span className="ml-auto">{time}</span>
      </div>
      <div className="mt-1 text-xs">
        <b>{it.actor_name ?? 'вЂ”'}</b> в†’ {it.target_name ?? 'вЂ”'}
      </div>
      <div className="mt-1 text-xs">
        рџ’° {it.coins_awarded ?? 0} В· вњЁ {it.xp_awarded ?? 0} В· P(win) {(it.win_prob ?? 0).toFixed(2)}
      </div>
    </div>
  );
}

