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
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { setMe(null); setLoading(false); return; }

      // 1) Prefer RPC (doesn't depend on profiles table)
      let got: UserRow | null = null;
      try {
        const { data: pub, error: perr } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
        if (!perr && Array.isArray(pub) && pub.length) {
          const r: any = pub[0];
          got = { uid: r.uid, xp: r.xp, creds: r.creds, hack_level: r.hack_level, sec_level: r.sec_level, bio: r.bio ?? null };
        }
      } catch { /* ignore if RPC missing */ }

      // 2) Fallback to select (no bio)
      if (!got) {
        const { data, error } = await supabase
          .from("users")
          .select("uid,xp,creds,hack_level,sec_level")
          .eq("uid", uid)
          .maybeSingle();
        if (error) throw new Error(error.message);
        got = { ...(data as any), bio: null } as UserRow;
      }

      setMe(got);
      setBio((got?.bio ?? localStorage.getItem("bio") ?? "") as string);

      // Active effects (ignore if RPC missing)
      try {
        const { data: eff, error: aerr } = await supabase.rpc("rpc_active_effects_for_me");
        if (!aerr) setEffects((eff ?? []) as any);
      } catch { /* ignore */ }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
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

      // Try persist; if server column missing, save locally
      const { error } = await supabase.from("users").update({ bio }).eq("uid", uid);
      if (error) {
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

  if (loading) {
    return <main className="max-w-3xl mx-auto px-4 py-10">Loading…</main>;
  }

  if (err && !me) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>
      </main>
    );
  }

  if (!me) {
    return <main className="max-w-3xl mx-auto px-4 py-10">No profile found.</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      <section className="rounded-2xl p-5 bg-white/10 text-white border border-white/15">
        <h1 className="text-xl font-bold">👤 Profile</h1>
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-white/10 border border-white/15">
            <div className="text-sm opacity-80">XP ✨</div>
            <div className="text-2xl font-bold">{me.xp}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/10 border border-white/15">
            <div className="text-sm opacity-80">Coins 💰</div>
            <div className="text-2xl font-bold">{me.creds}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/10 border border-white/15">
            <div className="text-sm opacity-80">Hacking 🗡️</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{me.hack_level}</div>
              <button onClick={() => void incStat("hack")}
                className="px-2 py-1 rounded-lg text-xs bg-white/10 border border-white/20 hover:bg-white/15">+ upgrade</button>
            </div>
          </div>
          <div className="rounded-xl p-4 bg-white/10 border border-white/15">
            <div className="text-sm opacity-80">Security 🛡️</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{me.sec_level}</div>
              <button onClick={() => void incStat("security")}
                className="px-2 py-1 rounded-lg text-xs bg-white/10 border border-white/20 hover:bg-white/15">+ upgrade</button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold">Bio 🗨️</div>
          <textarea
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            rows={3}
            placeholder="Drop a scary line to warn hackers…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button
            onClick={() => void saveBio()}
            disabled={saving}
            className="mt-2 px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 hover:bg-white/15 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save bio"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl p-5 bg-white/10 text-white border border-white/15">
        <h2 className="text-lg font-bold mb-3">✨ Active effects</h2>
        {effects.length === 0 ? (
          <div className="text-sm opacity-70">No active effects.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e) => (
              <li key={e.id} className="rounded-xl p-3 bg-white/10 border border-white/15">
                <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                <div className="text-xs opacity-80">{e.effect}</div>
                <div className="mt-2">
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