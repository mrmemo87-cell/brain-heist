'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { getUid } from '../../lib/auth';

type InvRow = {
  id: string;
  item_id: string;
  name: string | null;
  kind: string | null;
  state: string | null;
  acquired_at: string | null;
  expires_at: string | null;
};

export default function InventoryPage() {
  const supa = supabase;
  const [rows, setRows] = useState<InvRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const uid = await getUid(supabase);
      // direct table select (RLS allows own inventory)
      const { data, error } = await supabase
        .from('inventory')
        .select('id,item_id,name,kind,state,acquired_at,expires_at')
        .eq('uid', uid)
        .order('acquired_at', { ascending: false });
      if (error) throw new Error(error.message);
      setRows((data ?? []) as InvRow[]);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  async function activate(invId: string) {
    try {
      const { error } = await supabase.rpc('rpc_inventory_activate', { p_inventory_id: invId });
      if (error) throw new Error(error.message);
      await load(); // refresh
    } catch (e: any) {
      setErr(e?.message ?? 'Activate failed');
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="space-y-4">
      <h1>Inventory</h1>
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
      {loading ? (
        <div className="opacity-70 text-sm">Loading inventoryвЂ¦</div>
      ) : rows.length === 0 ? (
        <div className="opacity-70 text-sm">Nothing here yet. Try the shop or tasks.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl p-3 bg-[var(--c-card)]/70 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{r.name ?? r.item_id}</div>
                <div className="text-xs opacity-70">{r.kind ?? 'вЂ”'} В· {r.state ?? 'active'}</div>
                {r.expires_at && <div className="text-[11px] opacity-60">expires {new Date(r.expires_at).toLocaleString()}</div>}
              </div>
              <button onClick={() => void activate(r.id)} className="px-3 py-2 rounded-xl text-sm bg-[var(--c-primary)]/80 hover:opacity-90">
                Activate
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

