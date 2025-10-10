'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import ReactionBar from '@/components/ReactionBar';

type News = {
  event_id: string;
  created_at: string;                 // timestamptz (same as events.ts)
  type: string | null;
  actor_name: string | null;
  target_name: string | null;
  amount: number | null;
  xp: number | null;
  icon: string | null;
  payload?: any;                      // item/name/etc (view coalesces details_json/payload_json)
  reacts?: Record<string, number>;
};

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  let s = Math.max(0, Math.round((now - d) / 1000));
  const day = 86400, hr = 3600, min = 60;
  if (s < 60) return `${s}s ago`;
  const days = Math.floor(s / day); s %= day;
  const hours = Math.floor(s / hr); s %= hr;
  const mins = Math.floor(s / min);
  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

const COLORS: Record<string, string> = {
  HACK_WIN: 'ring-emerald-400 bg-emerald-500/10',
  HACK_FAIL: 'ring-rose-400 bg-rose-500/10',
  TASK_XP: 'ring-sky-400 bg-sky-500/10',
  SHOP_BUY: 'ring-violet-400 bg-violet-500/10',
  ITEM_ACTIVATE: 'ring-amber-400 bg-amber-500/10',
  ITEM_CONSUME: 'ring-amber-400 bg-amber-500/10',
  LOOT_OPEN: 'ring-fuchsia-400 bg-fuchsia-500/10',
};

const ALLOWED = new Set([
  'HACK_WIN', 'HACK_FAIL',
  'TASK_XP',
  'SHOP_BUY', 'ITEM_ACTIVATE', 'ITEM_CONSUME',
  'LOOT_OPEN',
]);

export default function HackFeed({ limit = 20 }: { limit?: number }) {
  const supa = supabase;
  const [rows, setRows] = useState<News[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function toMessage(n: News): { text: React.ReactNode; typeKey: string } | null {
    const t = n.type ?? '';
    const A = <b>{n.actor_name ?? '—'}</b>;
    const T = <b>{n.target_name ?? '—'}</b>;
    const name = (n.payload?.name as string) || (n.payload?.item_name as string) || (n.payload?.item_id as string) || '';
    const amount = n.amount ?? 0;
    switch (t) {
      case 'HACK_WIN':  return { text: <>{A} stole 💰{amount} from {T}</>, typeKey: 'HACK_WIN' };
      case 'HACK_FAIL': return { text: <>{A} tried to hack {T} and failed</>, typeKey: 'HACK_FAIL' };
      case 'TASK_XP':   return { text: <>{A} solved a task (+✨{n.xp ?? 0}{amount ? `, +💰${amount}` : ''})</>, typeKey: 'TASK_XP' };
      case 'SHOP_BUY':  return { text: <>{A} bought <b>{name || 'an item'}</b></>, typeKey: 'SHOP_BUY' };
      case 'ITEM_ACTIVATE': return { text: <>{A} activated <b>{name || 'an effect'}</b></>, typeKey: 'ITEM_ACTIVATE' };
      case 'ITEM_CONSUME':  return { text: <>{A} used <b>{name || 'an item'}</b></>, typeKey: 'ITEM_CONSUME' };
      case 'LOOT_OPEN':     return { text: <>{A} opened a loot crate{ name ? <> and got <b>{name}</b></> : ''}</>, typeKey: 'LOOT_OPEN' };
      default: return null; // hide noise like HACK_SUCCESS / raw internal events
    }
  }

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.rpc('rpc_news_latest_v2', { limit_n: limit });
      if (error) throw new Error(error.message);
      const arr = (Array.isArray(data) ? data : []) as News[];
      // strip types we don't render + quick de-dupe on same (ts,type,actor,target)
      const seen = new Set<string>();
      const clean = arr
        .filter(n => ALLOWED.has(n.type ?? ''))
        .filter(n => {
          const k = `${n.created_at}|${n.type}|${n.actor_name}|${n.target_name}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      setRows(clean);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const ch = supabase
      .channel('news-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_reactions' }, () => load())
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [supabase, limit]);

  return (
    <div className="space-y-3">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
      {loading ? (
        <div className="opacity-70 text-sm">Loading feed…</div>
      ) : rows.length === 0 ? (
        <div className="opacity-70 text-sm">Nothing yet. Try a hack or a task!</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => {
            const msg = toMessage(n);
            if (!msg) return null;
            const ring = COLORS[msg.typeKey] || 'ring-white/20 bg-[var(--c-card)]/70';
            return (
              <li key={n.event_id} className={`rounded-2xl p-3 shadow border ${ring} border-opacity-30`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">{msg.text}</div>
                  <div className="text-[11px] opacity-70">{timeAgo(n.created_at)}</div>
                </div>
                <div className="mt-2">
                  <ReactionBar eventTs={n.created_at} counts={n.reacts as any} onChanged={load} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
