'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { getUid } from '../../lib/auth';

type Item = {
  id: string;
  name: string;
  kind: string | null;
  price: number;
  active: boolean | null;
  stock: number | null;
  effect_hours: number | null;
  mult: number | null;
  power: number | null;
  description: string | null;
};

export default function ShopPage() {
  const supa = supabase;
  const [items, setItems] = useState<Item[]>([]);
  const [owned, setOwned] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const uid = await getUid(supabase);

      // list items (active)
      const { data: list, error: lerr } = await supabase
        .from('items')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });
      if (lerr) throw new Error(lerr.message);
      setItems((list ?? []) as Item[]);

      // owned counts (by item_id)
      const { data: inv, error: ierr } = await supabase
        .from('inventory')
        .select('item_id')
        .eq('uid', uid);
      if (ierr) throw new Error(ierr.message);
      const counts = Object.create(null) as Record<string, number>;
      for (const r of inv ?? []) {
        const key = (r as any).item_id as string;
        counts[key] = (counts[key] ?? 0) + 1;
      }
      setOwned(counts);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  }

  async function buy(id: string) {
    setBuying(id);
    try {
      const { error } = await supabase.rpc('rpc_shop_buy', { item_id: id });
      if (error) throw new Error(error.message);
      await load(); // refresh shop + owned counts
    } catch (e: any) {
      setErr(e?.message ?? 'Purchase failed');
    } finally {
      setBuying(null);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="space-y-4">
      <h1>Shop</h1>
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
      {loading ? (
        <div className="opacity-70 text-sm">Loading shopвЂ¦</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {items.map((it) => {
            const count = owned[it.id] ?? 0;
            return (
              <li key={it.id} className="rounded-2xl p-3 bg-[var(--c-card)]/70 border border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{it.name}</div>
                    <div className="text-xs opacity-70">{it.kind ?? 'вЂ”'} В· {it.description ?? ''}</div>
                    <div className="text-xs opacity-80 mt-1">Owned: {count}</div>
                  </div>
                  <button
                    disabled={!!buying}
                    onClick={() => void buy(it.id)}
                    className="px-3 py-2 rounded-xl text-sm bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50"
                  >
                    Buy рџ’°{it.price}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

