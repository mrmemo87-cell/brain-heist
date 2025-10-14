"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import { NeonBar } from "@/components/NeonBar";

type InvItem = {
  id: number;
  item_key: string;
  name: string | null;
  emoji: string | null;
  desc: string | null;
  status: "stashed" | "active";
  started_at: string | null;
  expires_at: string | null;
};

function pctReverse(started_at: string | null, expires_at: string | null) {
  if (!expires_at || !started_at) return 100;
  const s = new Date(started_at).getTime();
  const x = new Date(expires_at).getTime();
  const now = Date.now();
  if (now >= x) return 0;
  const total = Math.max(1, x - s);
  const left = Math.max(0, x - now);
  return Math.round((left / total) * 100); // remaining%
}

export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    try {
      // Prefer RPC if you have one:
      try {
        const { data, error } = await supabase.rpc("rpc_inventory_for_me");
        if (!error && data) {
          setItems((data as any).map((r:any)=>({
            id: r.id, item_key: r.item_key, name: r.name ?? r.item_key,
            emoji: r.emoji ?? "✨", desc: r.desc ?? "",
            status: r.status ?? "stashed", started_at: r.started_at, expires_at: r.expires_at
          })));
          return;
        }
      } catch {}
      // Fallback to a table
      const { data } = await supabase.from("inventory").select("*").order("id",{ascending:false});
      setItems(((data as any[]) ?? []).map((r:any)=>({
        id: r.id, item_key: r.item_key, name: r.name ?? r.item_key,
        emoji: r.emoji ?? "✨", desc: r.desc ?? "",
        status: (r.active ? "active" : "stashed") as any,
        started_at: r.started_at ?? null, expires_at: r.expires_at ?? null,
      })));
    } catch { setItems([]); }
  }

  useEffect(()=>{ void load(); },[]);

  const stashed = useMemo(()=> items.filter(i=>i.status==="stashed"), [items]);
  const active  = useMemo(()=> items.filter(i=>i.status==="active"), [items]);

  async function activate(it: InvItem) {
    setBusy(it.id); setMsg(null);
    try {
      // Try common RPC names
      const tries = [
        supabase.rpc("rpc_inventory_activate", { p_item_id: it.id } as any),
        supabase.rpc("rpc_inventory_activate", { item_id: it.id } as any),
        supabase.rpc("rpc_activate_item", { item_id: it.id } as any),
      ];
      let ok = false, lastErr:any=null;
      for (const t of tries) {
        const { error } = await t;
        if (!error) { ok = true; break; } else lastErr = error;
      }
      if (!ok) throw new Error(lastErr?.message || "RPC not found");

      setMsg(`Activated ${it.emoji ?? "✨"} ${it.name ?? it.item_key}`);
      await load();
    } catch {
      // Local demo fallback
      setMsg(`(Demo) Activated ${it.emoji ?? "✨"} ${it.name ?? it.item_key}`);
      setItems((prev)=> prev.map(p=> p.id===it.id ? ({
        ...p, status:"active", started_at:new Date().toISOString(),
        expires_at: new Date(Date.now()+15*60*1000).toISOString()
      }):p));
    } finally {
      setBusy(null);
      setTimeout(()=>setMsg(null), 1600);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <NeonCard title="🎒 Inventory" accent="pink">
        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm uppercase tracking-wide opacity-80 mb-2">Stashed</div>
            <div className="space-y-3">
              {stashed.length===0 && <div className="text-sm opacity-70">No stashed items.</div>}
              {stashed.map((it)=>(
                <div key={it.id} className="rounded-2xl bg-white/10 border border-white/15 p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{it.emoji} {it.name}</div>
                    {it.desc && <div className="text-xs opacity-80">{it.desc}</div>}
                  </div>
                  <button
                    disabled={busy===it.id}
                    onClick={()=>void activate(it)}
                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/30 hover:bg-white/20 text-sm disabled:opacity-40"
                  >
                    {busy===it.id?"Activating…":"Activate"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm uppercase tracking-wide opacity-80 mb-2">Active</div>
            <div className="space-y-3">
              {active.length===0 && <div className="text-sm opacity-70">No active effects.</div>}
              {active.map((it)=>(
                <div key={it.id} className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-2">
                  <div className="font-bold">{it.emoji} {it.name}</div>
                  {it.desc && <div className="text-xs opacity-80">{it.desc}</div>}
                  <NeonBar value={pctReverse(it.started_at, it.expires_at)} />
                  <div className="text-[11px] opacity-70">
                    {pctReverse(it.started_at, it.expires_at)}% remaining
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {msg && <div className="px-4 pb-4"><div className="rounded-xl bg-black/60 border border-white/20 px-3 py-2 text-sm">{msg}</div></div>}
      </NeonCard>
    </main>
  );
}