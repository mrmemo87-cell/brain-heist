'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/rpc';
import { makeBHClient } from '@/lib/bhClient';
import { SFX } from '@/lib/sfx';
import GlowButton from '@/components/GlowButton';
import ProgressBar from '@/components/ProgressBar';
import LootBoxes from '@/components/LootBoxes';
import PlayerAvatar from '@/components/PlayerAvatar';

const bh = makeBHClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Me = {
  user_id: string; username: string; batch: string;
  level: number; xp_total: number; coins_balance: number; streak_days: number;
  flair_thumb_url: string | null;
  avatar_url?: string | null;
};
type Inv = { item_id:number; key:string; name:string; qty:number; kind:string };
type ItemDef = { id:number; key:string; name:string; price_effective:number; image_url?:string|null; thumb_url?:string|null; };
type Costs = {
  hack_level: number; security_level: number; coins_balance: number;
  hack_next_cost: number; security_next_cost: number; hack_cap: number; security_cap: number;
};

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [inv, setInv] = useState<Inv[]>([]);
  const [itemsDef, setItemsDef] = useState<ItemDef[]>([]);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [rank, setRank] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const toast = useToast();

  const itemsByKey = useMemo(()=>Object.fromEntries(itemsDef.map(x=>[x.key,x])),[itemsDef]);

  const load = async () => {
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      const d = (await api.profileMe()) as Me[] | null;
      const m = d?.[0] ?? null;
      setMe(m);

      const invList = await bh.unwrap<Inv[]>(bh.rpc.rpc_inventory());
      setInv(invList ?? []);

      const defs = await api.shopList(); // reuse to get images
      setItemsDef((defs as any[]) ?? []);

      const c = await api.upgradeCosts();
      setCosts((c as any[])?.[0] ?? null);

      // rank badge (global): get top 100, find me
      const global = await api.leaderboard('global', null as any, 100);
      const idx = (global as any[])?.findIndex((r:any)=> r.user_id === m?.user_id);
      setRank(idx>=0 ? idx+1 : null);
    } catch (e: any) { setErr(e.message ?? 'Failed to load profile.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // live refresh when answers/hacks/purchases happen
    const fn = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('bh:profile:refresh', fn);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('bh:profile:refresh', fn);
      }
    };
  }, []);

  const unequipFlair = async () => {
    try { await api.unequipFlair(); toast('Flair unequipped'); await load(); }
    catch (e: any) { toast(e.message ?? 'Action failed'); }
  };

  const activateItem = async (key: string) => {
    try {
      await bh.unwrap(bh.rpc.rpc_activate_item(key));
      SFX.activate();
      toast('Activated ⚡');
      await load();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bh:profile:refresh'));
      }
    } catch (e:any) {
      toast(e.message || 'Activate failed');
    }
  };

  if (loading) return <AuthGate><div className="card p-4 animate-pulse">Loading…</div></AuthGate>;
  if (err) return <AuthGate><div className="text-red-400 text-sm">{err}</div></AuthGate>;
  if (!me) return <AuthGate><div className="text-ink-400">No profile.</div></AuthGate>;

  const hackPct = costs ? (costs.hack_level / Math.max(1, costs.hack_cap)) * 100 : 0;
  const secPct  = costs ? (costs.security_level / Math.max(1, costs.security_cap)) * 100 : 0;

  return (
    <AuthGate>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,.18),rgba(236,72,153,.1))]" />
        <div className="relative p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PlayerAvatar src={me.avatar_url ?? me.flair_thumb_url} />
            <div>
              <div className="text-2xl font-extrabold tracking-wide">
                {me.username} <span className="text-ink-300 text-base">({me.batch})</span>
                {rank && <span className="ml-2 text-xs px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30">🏆 Rank #{rank}</span>}
              </div>
              <div className="text-xs text-ink-400">
                Coins: <b className="text-emerald-300">{me.coins_balance}</b> • XP: <b className="text-violet-300">{me.xp_total}</b>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={unequipFlair}>Unequip flair</button>
        </div>
      </div>

      {/* Skills */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-2">⚡ Hack Skill</div>
          <div className="text-sm text-ink-300 mb-2">
            Level {costs?.hack_level ?? '-'} / {costs?.hack_cap ?? '-'} • Next: {costs?.hack_next_cost ?? '-'}c
          </div>
          <ProgressBar value={hackPct} max={100} />
          <div className="mt-3">
            <button
              className="btn btn-primary"
              disabled={!costs || (costs.hack_level >= (costs?.hack_cap ?? 0)) || ((me?.coins_balance ?? 0) < (costs?.hack_next_cost ?? 0))}
              onClick={async()=>{ await api.upgradeHack(1); SFX.levelUp(); await load(); if (typeof window!=='undefined'){ window.dispatchEvent(new CustomEvent('bh:profile:refresh')); } }}
            >
              Upgrade Hack
            </button>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">🛡️ Security Level</div>
          <div className="text-sm text-ink-300 mb-2">
            Level {costs?.security_level ?? '-'} / {costs?.security_cap ?? '-'} • Next: {costs?.security_next_cost ?? '-'}c
          </div>
          <ProgressBar value={secPct} max={100} />
          <div className="mt-3">
            <button
              className="btn btn-primary"
              disabled={!costs || (costs.security_level >= (costs?.security_cap ?? 0)) || ((me?.coins_balance ?? 0) < (costs?.security_next_cost ?? 0))}
              onClick={async()=>{ await api.upgradeSecurity(1); SFX.levelUp(); await load(); if (typeof window!=='undefined'){ window.dispatchEvent(new CustomEvent('bh:profile:refresh')); } }}
            >
              Upgrade Security
            </button>
          </div>
        </div>
      </div>

      {/* Activated (UI stub – awaits backend timers) */}
      <div className="pt-6">
        <div className="text-sm text-ink-300 mb-2">Activated</div>
        <div className="text-ink-400 text-sm">No tracked timers yet. (Expose durations via RPC to enable countdown bars.)</div>
      </div>

      {/* Inventory with images, blue Activate */}
      <div className="pt-6">
        <div className="text-sm text-ink-300 mb-2">Inventory</div>
        {inv.length === 0 && <div className="text-ink-400 text-sm">Empty</div>}
        <div className="grid md:grid-cols-2 gap-3">
          {inv.map(it=>{
            const def = itemsByKey[it.key];
            const img = def?.image_url ?? def?.thumb_url ?? '';
            return (
              <div key={it.item_id} className="card p-3 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-ink-800 grid place-items-center text-2xl">
                    {img ? <img src={img} alt={it.name} className="w-full h-full object-cover" /> : '😊'}
                  </div>
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-ink-400">{it.key} • x{it.qty}</div>
                  </div>
                </div>
                {it.kind==='consumable' ? (
                  <button
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md shadow-cyan-500/20 disabled:opacity-60"
                    onClick={()=>activateItem(it.key)}
                  >
                    Activate
                  </button>
                ) : it.key.startsWith('flair_') ? (
                  <button className="btn btn-ghost" onClick={async()=>{ await api.equipFlair(it.key); await load(); if (typeof window!=='undefined'){ window.dispatchEvent(new CustomEvent('bh:profile:refresh')); } }}>Equip</button>
                ) : null}
              </div>
          )})}
        </div>
      </div>

      {/* Loot boxes */}
      <div className="pt-6">
        <div className="text-sm text-ink-300 mb-2">Loot</div>
        <LootBoxes onOpened={load} />
      </div>
    </AuthGate>
  );
}
