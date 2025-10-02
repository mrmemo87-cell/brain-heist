'use client';
import { AuthGate } from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type Row = { rank:number; user_id:string; username:string; batch:string; level:number; xp_total:number; xp_display:string; coins_balance:number };

export default function Leaderboard() {
  const [batch,setBatch]=useState<'8A'|'8B'|'8C'>('8A');
  const [rows,setRows]=useState<Row[]>([]);
  const load = async()=>{ setRows(await api.leaderboard('batch', batch, 20) as Row[]); };
  useEffect(()=>{ load(); },[batch]);

  return (
    <AuthGate>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Leaderboard</h1>
        <div className="flex gap-2">
          {(['8A','8B','8C'] as const).map(b=>(
            <button key={b} onClick={()=>setBatch(b)} className={`px-3 py-1 rounded ${batch===b?'bg-emerald-600':'bg-slate-800'}`}>{b}</button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 rounded divide-y divide-slate-800">
        <div className="grid grid-cols-5 px-3 py-2 text-sm text-slate-400">
          <div>#</div><div>User</div><div>Batch</div><div>Level</div><div>XP</div>
        </div>
        {rows.map(r=>(
          <div key={r.user_id} className="grid grid-cols-5 px-3 py-2">
            <div>{r.rank}</div>
            <div className="truncate">{r.username}</div>
            <div>{r.batch}</div>
            <div>{r.level}</div>
            <div>{r.xp_display}</div>
          </div>
        ))}
      </div>
    </AuthGate>
  );
}
