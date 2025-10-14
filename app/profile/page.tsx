"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import RadialGauge from "@/components/RadialGauge";

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

      // Prefer RPC if available
      let got: UserRow | null = null;
      try {
        const { data: pub } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
        if (Array.isArray(pub) && pub.length) {
          const r: any = pub[0];
          got = { uid: r.uid, xp: r.xp, creds: r.creds, hack_level: r.hack_level, sec_level: r.sec_level, bio: r.bio ?? null };
        }
      } catch {}

      // Fallback to select
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
      setBio((got?.bio ?? window.localStorage.getItem("bio") ?? "") as string);

      // Active effects
      try {
        const { data: eff } = await supabase.rpc("rpc_active_effects_for_me");
        setEffects((eff ?? []) as any);
      } catch { setEffects([]); }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  // remaining % (0..100), green->yellow->red handled by gauge
  function remainingPct(e: ActiveEffect){
    if (!e.expires_at) return 100;
    const s = new Date(e.started_at).getTime();
    const x = new Date(e.expires_at).getTime();
    const now = Date.now();
    if (now >= x) return 0;
    const total = Math.max(1, x - s);
    const left  = Math.max(0, x - now);
    return Math.round((left/total)*100);
  }

  async function saveBio() {
    setSaving(true); setErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("users").update({ bio }).eq("uid", uid);
      if (error) {
        window.localStorage.setItem("bio", bio);
        throw new Error("Bio saved locally (server column missing).");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  async function incStat(stat: "hack" | "security") {
    setErr(null);
    try {
      const { error } = await supabase.rpc("rpc_upgrade_stat", { stat, levels: 1 } as any);
      if (error) throw new Error(error.message);
      await load();
    } catch (e: any) { setErr(e?.message ?? "Upgrade failed"); }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <main className="bh-shell py-10">LoadingвЂ¦</main>;
  if (!me) return <main className="bh-shell py-10">No profile found.</main>;

  return (
    <div className="grid gap-8">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <NeonCard title="XP" accent="lime">
          <div className="text-2xl font-extrabold">{me.xp.toLocaleString()}</div>
        </NeonCard>
        <NeonCard title="CREDITS" accent="orange">
          <div className="text-2xl font-extrabold">{me.creds.toLocaleString()}</div>
        </NeonCard>
        <NeonCard title="SECURITY LEVEL" accent="cyan">
          <div className="grid place-items-center">
            <RadialGauge value={Math.min(100, me.sec_level)} reverse />
          </div>
        </NeonCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NeonCard title="Hacking" accent="purple">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold">{me.hack_level}</div>
            <button onClick={() => void incStat("hack")}
              className="px-2 py-1 rounded-lg text-xs bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)]">
              + upgrade
            </button>
          </div>
        </NeonCard>
        <NeonCard title="Security" accent="cyan">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold">{me.sec_level}</div>
            <button onClick={() => void incStat("security")}
              className="px-2 py-1 rounded-lg text-xs bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)]">
              + upgrade
            </button>
          </div>
        </NeonCard>
      </div>

      <NeonCard title="Bio" accent="pink">
        <textarea
          className="mt-2 w-full rounded-xl bg-[rgba(255,255,255,.06)] border border-white/10 p-3 text-sm"
          rows={3}
          placeholder="Drop a scary line to warn hackersвЂ¦"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button onClick={() => void saveBio()} disabled={saving}
          className="mt-2 px-3 py-2 rounded-xl text-sm bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)] disabled:opacity-50">
          {saving ? "SavingвЂ¦" : "Save bio"}
        </button>
      </NeonCard>

      <NeonCard title="Active Effects" subtitle="Boosters/Shield timers" accent="lime">
        {effects.length === 0 ? (
          <div className="text-sm opacity-75">No active effects.</div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {effects.map((e) => {
              const pct = remainingPct(e);
              return (
                <li key={e.id} className="rounded-xl p-3 bg-[rgba(255,255,255,.04)] border border-white/10">
                  <div className="flex items-center gap-3">
                    <RadialGauge value={pct} reverse size={80} />
                    <div>
                      <div className="font-semibold">{e.item_key}</div>
                      <div className="text-xs opacity-75">{e.effect}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </NeonCard>
    </div>
  );
}
