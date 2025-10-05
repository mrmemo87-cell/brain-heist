'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
await api.shopBuy(id); SFX.buy();
await api.activateItem(key); SFX.activate();

type ShopItem = {
  item_id: number;
  key: string;
  name: string;
  price_effective: number;
  image_url?: string | null;
  thumb_url?: string | null;
  kind?: 'consumable' | 'cosmetic' | string;
};

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string>();
  const toast = useToast();

  const refresh = async () => {
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      const list = await api.shopList();
      setItems((list as any[]) ?? []);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load shop.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const buy = async (id: number) => {
    setBusy(id);
    try { await api.shopBuy(id); toast('Purchased 🛒'); }
    catch (e: any) { toast(e.message ?? 'Purchase failed'); }
    finally { setBusy(null); await refresh(); }
  };

  const activate = async (key: string) => {
    setBusy(-1);
    try { await api.activateItem(key); toast('Activated ⚡'); }
    catch (e: any) { toast(e.message ?? 'Activate failed'); }
    finally { setBusy(null); await refresh(); }
  };

  return (
    <AuthGate>
      <div className="mb-5">
        <h1 className="h1">Shop</h1>
        <div className="subtle">Buy boosters, shields, and cosmetics. Coins only — no real money.</div>
      </div>

      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-28 w-28 bg-ink-800 rounded-xl mb-3" />
              <div className="h-4 w-40 bg-ink-800 rounded mb-2" />
              <div className="h-3 w-24 bg-ink-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {!loading && !err && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={`${it.item_id}-${it.key}`} className="card card-hover p-4 flex gap-4">
              <div className="w-28 shrink-0">
                <img
                  src={it.image_url ?? it.thumb_url ?? ''}
                  alt={it.name}
                  className="w-28 h-28 object-contain rounded-xl bg-ink-800"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase text-ink-300">{it.kind ?? 'item'}</div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-ink-300">{it.key}</div>
                <div className="mt-2 text-emerald-300 font-medium">{it.price_effective}c</div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn btn-primary disabled:opacity-60"
                    disabled={busy !== null}
                    onClick={() => buy(it.item_id)}
                  >
                    {busy === it.item_id ? 'Buying…' : 'Buy'}
                  </button>
                  {/* for consumables like boosters/shields */}
                  <button
                    className="btn btn-ghost disabled:opacity-60"
                    disabled={busy !== null}
                    onClick={() => activate(it.key)}
                  >
                    {busy === -1 ? 'Activating…' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AuthGate>
  );
}
