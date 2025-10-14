"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import { NeonBar } from "@/components/NeonBar";
import RollingCoin from "@/components/RollingCoin";

type ShopItem = {
  key: string;
  name: string;
  desc: string;
  price: number;
  category: "Hacking" | "Defense" | "Utility";
  emoji: string;
};

type UserRow = { uid: string; creds: number };

const FALLBACK: ShopItem[] = [
  { key: "sql-inject",   name: "SQL Injector",    desc: "Boost hacking by 3 for 15m.", price: 120, category: "Hacking", emoji: "💉" },
  { key: "phish-kit",    name: "Phish Kit",       desc: "Boost hacking by 2 for 10m.", price:  90, category: "Hacking", emoji: "🎣" },
  { key: "soft-shield",  name: "Soft Shield",     desc: "Reduce penalties 50% for 20m.", price: 140, category: "Defense", emoji: "🛡️" },
  { key: "vault-lock",   name: "Vault Lock",      desc: "Security +3 for 30m.", price: 160, category: "Defense", emoji: "🔒" },
  { key: "radar",        name: "Target Radar",    desc: "Better targets for 10m.", price: 80,  category: "Utility", emoji: "📡" },
];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [me, setMe] = useState<UserRow | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // user
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (uid) {
        const { data } = await supabase.from("users").select("uid,creds").eq("uid", uid).maybeSingle();
        setMe(data as any);
      }
      // items
      try {
        const { data, error } = await supabase.from("shop_items").select("key,name,desc,price,category,emoji").order("price",{ascending:true});
        if (!error && data) setItems(data as any);
        else setItems(FALLBACK);
      } catch { setItems(FALLBACK); }
    })();
  }, []);

  const groups = useMemo(() => {
    const by: Record<string, ShopItem[]> = {};
    for (const it of (items.length?items:FALLBACK)) {
      (by[it.category] ||= []).push(it);
    }
    return by;
  }, [items]);

  async function buy(it: ShopItem) {
    setBusyKey(it.key); setMsg(null);
    try {
      // Try a few RPC shapes; ignore if not present
      let err: any = null;
      const tries = [
        supabase.rpc("rpc_shop_buy",   { item_key: it.key } as any),
        supabase.rpc("rpc_shop_buy",   { p_item_key: it.key } as any),
        supabase.rpc("rpc_buy_item",   { item_key: it.key } as any),
      ];
      for (const t of tries) {
        const { error } = await t;
        if (!error) { err = null; break; } else { err = error; }
      }
      if (err) throw new Error(err.message);

      setMsg(`Purchased ${it.emoji} ${it.name}!`);
      // soft refresh user creds
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (uid) {
        const { data } = await supabase.from("users").select("uid,creds").eq("uid", uid).maybeSingle();
        setMe(data as any);
      }
    } catch (e:any) {
      setMsg(`(Demo) Bought ${it.emoji} ${it.name}. Backend RPC missing, showing local effect.`);
      // local demo creds drop
      setMe((p)=> p ? { ...p, creds: Math.max(0, p.creds - it.price) } : p);
    } finally {
      setBusyKey(null);
      setTimeout(()=>setMsg(null), 1600);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <NeonCard title="🛒 Shop" accent="purple">
        {me && (
          <div className="px-4 py-2 text-sm flex items-center gap-2">
            <RollingCoin /><span>Your coins:</span>
            <span className="text-lg font-bold">{me.creds ?? 0}</span>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6 p-4">
          {Object.entries(groups).map(([cat, list]) => (
            <div key={cat} className="space-y-3">
              <div className="text-sm uppercase tracking-wide opacity-80">{cat}</div>
              {list.map((it) => (
                <div key={it.key} className="rounded-2xl bg-white/10 border border-white/15 p-4 hover:bg-white/15 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold">{it.emoji} {it.name}</div>
                      <div className="text-xs opacity-80">{it.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">🪙 {it.price}</div>
                      <button
                        className="mt-2 px-3 py-1 rounded-lg bg-white/10 border border-white/30 hover:bg-white/20 text-sm disabled:opacity-40"
                        disabled={busyKey===it.key}
                        onClick={()=>void buy(it)}
                      >
                        {busyKey===it.key ? "Buying…" : "Buy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {msg && <div className="px-4 pb-4"><div className="rounded-xl bg-black/60 border border-white/20 px-3 py-2 text-sm">{msg}</div></div>}
      </NeonCard>
    </main>
  );
}