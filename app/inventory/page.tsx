"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import ProgressBar from "@/components/ProgressBar";

type InvRow = {
  id: string;
  uid: string;
  item_id: string;
  acquired_at?: string | null;
  // joined item
  name?: string | null;
  kind?: string | null;
  description?: string | null;
};

type ActiveEffect = {
  id: number;
  item_key: string;
  effect: string;
  started_at: string;
  expires_at: string | null;
  duration_seconds: number;
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

function groupByKind(items: InvRow[]) {
  const out: Record<string, InvRow[]> = {};
  for (const it of items) {
    const k = (it.kind ?? "misc").toLowerCase();
    out[k] = out[k] ?? [];
    out[k].push(it);
  }
  return out;
}

export default function InventoryPage() {
  const [inv, setInv] = useState<InvRow[]>([]);
  const [active, setActive] = useState<ActiveEffect[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      // inventory + joined item details
      const { data: list, error: ierr } = await supabase
        .from("inventory")
        .select("id,uid,item_id,acquired_at, items(name,kind,description)")
        .order("acquired_at", { ascending: false });
      if (ierr) throw new Error(ierr.message);

      const normalized = (list ?? []).map((r: any) => ({
        id: r.id, uid: r.uid, item_id: r.item_id, acquired_at: r.acquired_at,
        name: r.items?.name ?? null, kind: r.items?.kind ?? null, description: r.items?.description ?? null
      })) as InvRow[];
      setInv(normalized);

      // active effects
      const { data: eff, error: aerr } = await supabase
        .rpc("rpc_active_effects_for_me"); // server-side helper listed in your DB
      if (aerr) {
        // not fatal if missing
        console.warn("active effects rpc:", aerr.message);
        setActive([]);
      } else {
        setActive((eff ?? []) as any);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  async function activate(invId: string, itemId: string) {
    setActivating(invId);
    try {
      // Try common signatures; fall back gracefully
      let rpcErr: any = null;
      let res = await supabase.rpc("rpc_inventory_activate", { inventory_id: invId, item_id: itemId } as any);
      if (res.error) {
        // try alternative param name
        res = await supabase.rpc("rpc_inventory_activate", { inv_id: invId, item_id: itemId } as any);
      }
      rpcErr = res.error;
      if (rpcErr) throw new Error(rpcErr.message);
      await load(); // refresh inventory + effects
    } catch (e: any) {
      setErr(e?.message ?? "Activation failed");
    } finally {
      setActivating(null);
    }
  }

  useEffect(() => { void load(); }, []);
  const grouped = useMemo(() => groupByKind(inv), [inv]);

  // progress for active effects (reverse count down)
  function effectPct(e: ActiveEffect) {
    if (!e.expires_at) return 100;
    const start = new Date(e.started_at).getTime();
    const end = new Date(e.expires_at).getTime();
    const now = Date.now();
    if (now >= end) return 0;
    const total = Math.max(1, end - start);
    const left = Math.max(0, end - now);
    return Math.round((left / total) * 100);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-2">🎒 Inventory</h1>
        {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
        {loading ? (
          <div className="opacity-70 text-sm">Loading inventory…</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([kind, arr]) => (
              <section key={kind} className="space-y-3">
                <h2 className="text-lg font-semibold">
                  {(KIND_ICON[kind] ?? "🔮")} {kind.charAt(0).toUpperCase()+kind.slice(1)}
                </h2>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {arr.map((r) => (
                    <li key={r.id}
                      className="rounded-2xl p-4 bg-white text-black border border-black/10 hover:shadow-[0_0_30px_rgba(0,0,0,.15)] transition">
                      <div className="text-sm font-semibold">
                        {(KIND_ICON[(r.kind ?? "misc").toLowerCase()] ?? "🔮")} {r.name ?? r.item_id}
                      </div>
                      <div className="text-xs opacity-80">{r.description ?? "—"}</div>
                      <button
                        disabled={!!activating}
                        onClick={() => void activate(r.id, r.item_id)}
                        className="mt-3 px-3 py-2 rounded-xl text-sm bg-black text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {activating === r.id ? "Activating…" : "Activate"}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">✨ Active Effects</h2>
        {active.length === 0 ? (
          <div className="text-sm opacity-70">No active effects.</div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((e) => (
              <li key={e.id} className="rounded-2xl p-4 bg-white text-black border border-black/10">
                <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                <div className="text-xs opacity-80">{e.effect}</div>
                <div className="mt-2">
                  <ProgressBar value={effectPct(e)} reverse height={8} label={`${effectPct(e)}%`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}