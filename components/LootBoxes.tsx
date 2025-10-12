'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { useAudio } from '@/components/AudioProvider';

type LootRow = {
  id: string;
  name: string | null;
  kind: string | null;       // expect 'loot'
  state: string | null;      // 'active', 'used', etc
  acquired_at: string | null;
};

export default function LootBoxes({ onOpened }: { onOpened?: () => void | Promise<void> }) {
  const supa = supabase;
  const sfx = useAudio();

  const [rows, setRows] = useState<LootRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { return; }

      const { data, error } = await supabase
        .from('inventory')
        .select('id,name,kind,state,acquired_at')
        .eq('uid', uid)
        .eq('kind', 'loot')
        .order('acquired_at', { ascending: false });

      if (error) throw new Error(error.message);
      setRows((data ?? []) as LootRow[]);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load loot boxes');
    } finally {
      setLoading(false);
    }
  }

  async function openBox(invId: string) {
    setOpening(invId);
    try {
      const { error } = await supabase.rpc('rpc_inventory_activate', { p_inventory_id: invId });
      if (error) throw new Error(error.message);
      await sfx.collect?.(); // opening/claim sound
      await load();          // refresh list
      await onOpened?.();    // let parent refresh feed/stats if it wants
    } catch (e: any) {
      setErr(e?.message ?? 'Open failed');
      await sfx.wrong?.();
    } finally {
      setOpening(null);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Loot Boxes</h3>
        <button onClick={()=>void load()} className="text-xs opacity-70 hover:opacity-100">Refresh</button>
      </div>

      {err && <div className="text-xs rounded-xl bg-rose-500/15 border border-rose-500/40 p-2 mb-2">{err}</div>}

      {loading ? (
        <div className="opacity-70 text-sm">LoadingвЂ¦</div>
      ) : rows.length === 0 ? (
        <div className="opacity-70 text-sm">No loot right now. Try the shop or tasks to earn some.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl p-3 bg-black/25 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{r.name ?? 'Loot Box'}</div>
                <div className="text-[11px] opacity-70">state: {r.state ?? 'active'}</div>
              </div>
              <button
                disabled={!!opening || r.state === 'used'}
                onClick={() => void openBox(r.id)}
                className="px-3 py-2 rounded-xl text-sm bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50"
              >
                {opening === r.id ? 'OpeningвЂ¦' : 'Open'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

