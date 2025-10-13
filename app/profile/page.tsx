"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import ProgressBar from "@/components/ProgressBar";

type UserRow = {
  uid: string;
  xp: number;
  creds: number;
  hack_level: number;
  sec_level: number;
  bio?: string | null;
};

type ActiveEffect = {
  id: number;
  item_key: string;
  effect: string;
  started_at: string;
  expires_at: string | null;
  duration_seconds: number;
};

export default function ProfilePage() {
  const [me, setMe] = useState<UserRow | null>(null);
  const [bio, setBio] = useState("");
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { setMe(null); return; }

      const { data, error } = await supabase
        .from("users")
        .select("uid,xp,creds,hack_level,sec_level,bio")
        .eq("uid", uid)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const row = (data as any) ?? null;
      setMe(row);
      setBio((row?.bio ?? localStorage.getItem("bio") ?? "") as string);

      const { data: eff, error: aerr } = await supabase.rpc("rpc_active_effects_for_me");
      if (!aerr) setEffects((eff ?? []) as any);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load profile");
    }
  }

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

  async function saveBio() {
    setSaving(true); setErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) throw new Error("Not signed in");

      const { error } = await supabase.from("users")
        .update({ bio })
        .eq("uid", uid);
      if (error) {
        // Fallback: if column doesn't exist, keep it locally
        localStorage.setItem("bio", bio);
        throw new Error("Bio saved locally (server column missing).");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function incStat(stat: "hack" | "security") {
    setErr(null);
    try {
      const { error } = await supabase.rpc("rpc_upgrade_stat", { stat, levels: 1 } as any);
      if (error) throw new Error(error.message);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Upgrade failed");
    }
  }

  useEffect(() => { void load(); }, []);

  if (!me) {
    return <main className="max-w-3xl mx-auto px-4 py-10">Loading…</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      <section className="rounded-2xl p-5 bg-white text-black border border-black/10">
        <h1 className="text-xl font-bold">👤 Profile</h1>
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-white/80 border border-black/10">
            <div className="text-sm opacity-70">XP ✨</div>
            <div className="text-2xl font-bold">{me.xp}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/80 border border-black/10">
            <div className="text-sm opacity-70">Coins 💰</div>
            <div className="text-2xl font-bold">{me.creds}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/80 border border-black/10">
            <div className="text-sm opacity-70">Hacking 🗡️</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{me.hack_level}</div>
              <button onClick={() => void incStat("hack")}
                className="px-2 py-1 rounded-lg text-xs bg-black text-white hover:opacity-90">+ upgrade</button>
            </div>
          </div>
          <div className="rounded-xl p-4 bg-white/80 border border-black/10">
            <div className="text-sm opacity-70">Security 🛡️</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{me.sec_level}</div>
              <button onClick={() => void incStat("security")}
                className="px-2 py-1 rounded-lg text-xs bg-black text-white hover:opacity-90">+ upgrade</button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold">Bio 🗨️</div>
          <textarea
            className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm"
            rows={3}
            placeholder="Drop a scary line to warn hackers…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button
            onClick={() => void saveBio()}
            disabled={saving}
            className="mt-2 px-3 py-2 rounded-xl text-sm bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save bio"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl p-5 bg-white text-black border border-black/10">
        <h2 className="text-lg font-bold mb-3">✨ Active effects</h2>
        {effects.length === 0 ? (
          <div className="text-sm opacity-70">No active effects.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e) => (
              <li key={e.id} className="rounded-xl p-3 bg-white/80 border border-black/10">
                <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                <div className="text-xs opacity-80">{e.effect}</div>
                <div className="mt-2">
                  {/* ✅ simpler & safe */}
                  <ProgressBar value={Math.max(0, Math.min(100, effectPct(e)))} reverse height={8} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
