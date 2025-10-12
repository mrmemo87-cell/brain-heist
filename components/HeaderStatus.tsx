'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/rpc';

type Me = { xp_total:number; coins_balance:number };

export default function HeaderStatus() {
  const [me,setMe] = useState<Me|null>(null);
  useEffect(() => { (async () => {
    try { const rows = await api.profileMe() as any[]; setMe(rows?.[0] ?? null); } catch {}
  })(); }, []);
  if (!me) return null;
  return <div className="text-sm text-slate-300">XP {me.xp_total} вЂў Coins {me.coins_balance}</div>;
}

