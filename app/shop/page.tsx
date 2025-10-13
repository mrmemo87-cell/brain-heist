"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supa";
import { getUid } from "@/lib/auth";

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

const KIND_ICON: Record<string, string> = {
  defense: "🛡️",
  security: "🛡️",
  booster: "⚡",
  boost: "⚡",
  offense: "🗡️",
  hack: "🗡️",
  utility: "🧰",
  misc: "🔮",
};

function groupByKind(items: Item[]) {
  const out: Record<string, Item[]> = {};
  for (const it of items) {
    const k = (it.kind ?? "misc").toLowerCase();
    out[k] = out[k] ?? [];
    out[k].push(it);
  }
  return out;
}

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [owned, setOwned] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const uid = await getUid(supabase);

      const { data: list, error: lerr } = await supabase
        .from("items").select("*")
        .eq("active", true)
        .order("price", { ascending: true });
      if (lerr) throw new Error(lerr.message);
      setItems((list ?? []) as Item[]);

      const { data: inv, error: ierr } = await supabase
        .from("inventory").select("item_id")
        .eq("uid", uid);
      if (ierr) throw new Error(ierr.message);
      const counts: Record<string, number> = {};
      for (const r of inv ?? []) {
        const key = (r as any).item_id as string;
        counts[key] = (counts[key] ?? 0) + 1;
      }
      setOwned(counts);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load shop");
    } finally {
      setLoading(false);
    }
  }

  async function buy(id: string) {
    setBuying(id);
    try {
      const { error } = await supabase.rpc("rpc_shop_buy", { item_id: id });
      if (error) throw new Error(error.message);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Purchase failed");
    } finally {
      setBuying(null);
    }
  }

  useEffect(() => { void load(); }, []);
  const grouped = useMemo(() => groupByKind(items), [items]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-2">🛒 Shop</h1>
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
      {loading ? (
        <div className="opacity-70 text-sm">Loading shop…</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([kind, arr]) => (
            <section key={kind} className="space-y-3">
              <h2 className="text-lg font-semibold">
                {(KIND_ICON[kind] ?? "🔮")} {kind.charAt(0).toUpperCase()+kind.slice(1)}
              </h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {arr.map((it) => {
                  const count = owned[it.id] ?? 0;
                  return (
                    <li key={it.id}
                      className="rounded-2xl p-4 bg-white text-black border border-black/10 hover:shadow-[0_0_30px_rgba(0,0,0,.15)] transition">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {(KIND_ICON[kind] ?? "🔮")} {it.name}
                          </div>
                          <div className="text-xs opacity-80">
                            {it.description ?? "—"}
                          </div>
                          <div className="text-xs mt-1 opacity-70">
                            Owned: <b>{count}</b>
                          </div>
                        </div>
                        <button
                          disabled={!!buying}
                          onClick={() => void buy(it.id)}
                          className="px-3 py-2 rounded-xl text-sm bg-black text-white hover:opacity-90 disabled:opacity-50"
                        >
                          Buy 💰{it.price}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}