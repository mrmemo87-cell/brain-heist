'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';

type Me = {
  user_id: string;
  username: string;
  batch: string;
  level: number;
  xp_total: number;
  coins_balance: number;
  streak_days: number;
  flair_item_id: number | null;
  flair_key: string | null;
  flair_name: string | null;
  flair_image_url: string | null;
  flair_thumb_url: string | null;
};
type Inv = { item_id:number; key:string; name:string; qty:number; kind:string };
const [inv,setInv]=useState<Inv[]>([]);

const load = async () => {
  // ... existing
  const invList = await api.rpc<any[]>('rpc_inventory');
  setInv(invList ?? []);
};
type Costs = {
  hack_level: number;
  security_level: number;
  coins_balance: number;
  hack_next_cost: number;
  security_next_cost: number;
  hack_cap: number;
  security_cap: number;
};
const [costs, setCosts] = useState<Costs | null>(null);

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const toast = useToast();
const load = async () => {
  setLoading(true); setErr(undefined);
  try {
    await api.touchLogin();
    const d = (await api.profileMe()) as Me[] | null;
    setMe(d?.[0] ?? null);
    const invList = await api.rpc<any[]>('rpc_inventory');
    setInv(invList ?? []);
    const c = await api.upgradeCosts();
    setCosts((c as any[])?.[0] ?? null);
  } catch (e: any) {
    setErr(e.message ?? 'Failed to load profile.');
  } finally {
    setLoading(false);
  }
};
{costs && (
  <div className="card p-5 space-y-3">
    <div className="font-semibold">Upgrades</div>
    <div className="grid md:grid-cols-2 gap-3">
      <div className="card p-3">
        <div className="text-xs uppercase text-ink-400 mb-1">Hack Skill</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{costs.hack_level} / {costs.hack_cap}</div>
            <div className="text-sm text-ink-300">Next cost: {costs.hack_next_cost}c</div>
          </div>
          <button
            className="btn btn-primary disabled:opacity-60"
            disabled={costs.hack_level >= costs.hack_cap || (me?.coins_balance ?? 0) < costs.hack_next_cost}
            onClick={async()=>{
              const r = await api.upgradeHack(1);
              toast('⚡ Hack skill upgraded');
              await load();
            }}
          >
            Upgrade
          </button>
        </div>
      </div>

      <div className="card p-3">
        <div className="text-xs uppercase text-ink-400 mb-1">Security Level</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{costs.security_level} / {costs.security_cap}</div>
            <div className="text-sm text-ink-300">Next cost: {costs.security_next_cost}c</div>
          </div>
          <button
            className="btn btn-primary disabled:opacity-60"
            disabled={costs.security_level >= costs.security_cap || (me?.coins_balance ?? 0) < costs.security_next_cost}
            onClick={async()=>{
              const r = await api.upgradeSecurity(1);
              toast('🛡️ Security upgraded');
              await load();
            }}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
    <div className="text-xs text-ink-400">
      Costs grow ~25% each level. Caps at {costs.hack_cap}. Plan your coins wisely.
    </div>
  </div>
)}
// call this when user clicks a box
async function openBox(choice:number) {
  try {
    const res = await api.rpc<any[]>('rpc_open_loot', { _choice: choice });
    const r = res?.[0];
    if (!r) { toast('No reward'); return; }
    if (r.kind === 'coins') toast(`+${r.amount} coins!`);
    else if (r.kind === 'xp') toast(`+${r.amount} XP!`);
    else if (r.kind === 'item') toast(`You got item: ${r.item_key}!`);
    // reload profile
    await load();
  } catch (e:any) {
    toast(e.message || 'Failed to open box');
  }
}
  const load = async () => {
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      const d = (await api.profileMe()) as Me[] | null;
      setMe(d?.[0] ?? null);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unequipFlair = async () => {
    try { await api.unequipFlair(); toast('Flair unequipped'); await load(); }
    catch (e: any) { toast(e.message ?? 'Action failed'); }
  };

  return (
    <AuthGate>
      <div className="mb-5">
        <h1 className="h1">Profile</h1>
        <div className="subtle">Your identity and season progress.</div>
      </div>

      {loading && (
        <div className="card p-4 animate-pulse">
          <div className="h-4 w-40 bg-ink-800 rounded mb-2" />
          <div className="h-3 w-64 bg-ink-800 rounded mb-2" />
          <div className="h-3 w-48 bg-ink-800 rounded" />
        </div>
      )}

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {!loading && me && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold">{me.username} <span className="text-ink-300 text-base">({me.batch})</span></div>
              <div className="text-sm text-ink-300">User ID: <span className="text-ink-400">{me.user_id.slice(0,8)}…</span></div>
            </div>
            {me.flair_thumb_url && (
              <img src={me.flair_thumb_url} alt={me.flair_name ?? ''} className="w-12 h-12 rounded-lg bg-ink-800" />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Level" value={me.level} />
            <Stat label="XP" value={me.xp_total} />
            <Stat label="Coins" value={me.coins_balance} />
            <Stat label="Streak" value={`${me.streak_days}d`} />
          </div>

          <div className="pt-2">
            <div className="text-sm text-ink-300 mb-1">Flair</div>
            {me.flair_key ? (
              <div className="flex items-center gap-3">
                {me.flair_thumb_url && <img src={me.flair_thumb_url} alt={me.flair_name ?? ''} className="w-10 h-10 rounded bg-ink-800" />}
                <div className="text-sm">{me.flair_name}</div>
                <button className="btn btn-ghost" onClick={unequipFlair}>Unequip</button>
              </div>
            ) : (
              <div className="text-sm text-ink-400">None equipped</div>
            )}
          </div>
        </div>
      )}
    </AuthGate>
  );
}
<div className="pt-4">
  <div className="text-sm text-ink-300 mb-2">Inventory</div>
  {inv.length === 0 && <div className="text-ink-400 text-sm">Empty</div>}
  <div className="grid md:grid-cols-2 gap-3">
    {inv.map(it=>(
      <div key={it.item_id} className="card p-3 flex items-center justify-between">
        <div>
          <div className="font-medium">{it.name}</div>
          <div className="text-xs text-ink-400">{it.key} • x{it.qty}</div>
        </div>
        {it.kind==='consumable' ? (
          <button className="btn btn-ghost" onClick={async()=>{ await api.activateItem(it.key); await load(); }}>Activate</button>
        ) : it.key.startsWith('flair_') ? (
          <button className="btn btn-ghost" onClick={async()=>{ await api.equipFlair(it.key); await load(); }}>Equip</button>
        ) : null}
      </div>
    ))}
  </div>
</div>

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs uppercase text-ink-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
