'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/rpc';

type Row = {
  id: number; attacker_name: string; defender_name: string; outcome: string;
  xp_awarded: number; coins_awarded: number; defender_coins_lost: number;
  win_prob: number; created_at: string;
};

export default function HackFeed({ limit = 20, usernames = [] as string[] }:{
  limit?: number; usernames?: string[];
}) {
  const [rows,setRows] = useState<Row[]>([]);
  const [err,setErr] = useState<string>();
  const [reactions,setReactions] = useState<Record<number,string>>({});

  useEffect(()=>{ (async()=>{
    try{ const data = await api.hackFeed(limit); setRows((data as any[]) ?? []); }
    catch(e:any){ setErr(e.message ?? 'Failed to load activity.'); }
  })(); },[limit]);

  const filtered = useMemo(()=>{
    if (!usernames.length) return rows;
    const set = new Set(usernames.map(n=>n?.toLowerCase()));
    return rows.filter(r => set.has(r.attacker_name?.toLowerCase()) || set.has(r.defender_name?.toLowerCase()));
  },[rows,usernames]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!filtered.length) return <div className="text-ink-400 text-sm">No activity yet.</div>;

  return (
    <div className="space-y-2">
      {filtered.map((r:any)=>(
        <div key={r.id} className={[
          'card p-3 flex items-center justify-between border',
          r.outcome==='win' ? 'border-emerald-700/40 bg-emerald-950/20' : 'border-rose-700/40 bg-rose-950/20'
        ].join(' ')}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{r.outcome==='win' ? '🟢' : '🔴'}</span>
            <div className="text-sm">
              <b>{r.attacker_name}</b> hacked <b>{r.defender_name}</b>
              {r.outcome==='win' ? ' and WON' : ' and lost'}
              {' '}• +{r.coins_awarded ?? 0}c • +{r.xp_awarded ?? 0}xp
            </div>
          </div>
          <div className="flex items-center gap-2 text-lg">
            {['🔥','😎','🥶','💀','👏'].map(em=>(
              <button key={em} onClick={()=>setReactions(x=>({ ...x, [r.id]: em }))} className="hover:scale-110 transition">{em}</button>
            ))}
            <div className="text-sm text-ink-400 ml-2">{reactions[r.id] ?? ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
