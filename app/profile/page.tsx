'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type Me = {
  user_id:string; username:string; batch:string; level:number;
  xp_total:number; coins_balance:number; streak_days:number;
  flair_item_id:number|null; flair_key:string|null; flair_name:string|null; flair_image_url:string|null; flair_thumb_url:string|null;
};

export default function Profile() {
  const [me,setMe]=useState<Me|null>(null);
  const [msg,setMsg]=useState<string|undefined>();
  const load = async()=>{ const d = await api.profileMe() as Me[]; setMe(d?.[0] ?? null); };
  useEffect(()=>{ load(); },[]);

  const unequip = async()=>{ setMsg(undefined); try{ await api.unequipFlair(); await load(); setMsg('Unequipped'); }catch(e:any){ setMsg(e.message); } };

  return (
    <AuthGate>
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      {msg && <div className="mb-3 text-sm text-emerald-400">{msg}</div>}
      {!me ? <div>Loading…</div> : (
        <div className="bg-slate-900 rounded p-4 space-y-2">
          <div className="text-lg font-semibold">{me.username} <span className="text-slate-400 text-sm">({me.batch})</span></div>
          <div className="text-sm text-slate-300">Level {me.level} • XP {me.xp_total} • Coins {me.coins_balance}</div>
          <div className="text-sm text-slate-400">Streak: {me.streak_days} days</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-sm">Flair:</div>
            {me.flair_key ? (
              <>
                <img src={me.flair_thumb_url ?? ''} alt={me.flair_name ?? ''} className="w-8 h-8 rounded bg-slate-800" />
                <span className="text-sm">{me.flair_name}</span>
                <button onClick={unequip} className="px-2 py-1 text-xs bg-slate-800 rounded">Unequip</button>
              </>
            ) : <span className="text-sm text-slate-400">None</span>}
          </div>
        </div>
      )}
    </AuthGate>
  );
}
