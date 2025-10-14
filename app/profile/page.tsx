"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import RadialGauge from "@/components/RadialGauge";
import ProgressBar from "@/components/ProgressBar";
import NeonAvatar from "@/components/NeonAvatar";

type UserRow = {
  uid: string; xp: number; creds: number;
  hack_level: number; sec_level: number; bio?: string | null;
};
type ActiveEffect = {
  id: number; item_key: string; effect: string;
  started_at: string; expires_at: string | null; duration_seconds: number;
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

      // best-effort public profile
      let got: UserRow | null = null;
      try {
        const { data, error } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
        if (!error && Array.isArray(data) && data[0]) {
          const r:any = data[0];
          got = { uid:r.uid, xp:r.xp, creds:r.creds, hack_level:r.hack_level, sec_level:r.sec_level, bio:r.bio ?? null };
        }
      } catch {}

      if (!got) {
        const { data, error } = await supabase.from("users")
          .select("uid,xp,creds,hack_level,sec_level").eq("uid", uid).maybeSingle();
        if (error) throw new Error(error.message);
        got = { ...(data as any), bio: null } as UserRow;
      }

      setMe(got);
      setBio((got?.bio ?? localStorage.getItem("bio") ?? "") as string);

      // effects: RPC if exists, else localStorage fallback (from inventory activation)
      let eff:ActiveEffect[] = [];
      try {
        const { data, error } = await supabase.rpc("rpc_active_effects_for_me");
        if (!error) eff = (data ?? []) as any;
      } catch {}
      if (!eff.length) {
        try { eff = JSON.parse(localStorage.getItem("active_effects") ?? "[]"); } catch {}
      }
      setEffects(eff);
    } catch (e:any) {
      setErr(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function effectPct(e: ActiveEffect) {
    if (!e.expires_at) return 100;
    const s = new Date(e.started_at).getTime();
    const x = new Date(e.expires_at).getTime();
    const now = Date.now();
    if (now >= x) return 0;
    const total = Math.max(1, x - s);
    const left  = Math.max(0, x - now);
    return Math.round((left / total) * 100);
  }

  async function saveBio() {
    setSaving(true); setErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("users").update({ bio }).eq("uid", uid);
      if (error) {
        localStorage.setItem("bio", bio);
        throw new Error("Bio saved locally (server column missing).");
      }
    } catch (e:any) {
      setErr(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  async function incStat(stat: "hack"|"security") {
    setErr(null);
    try {
      const { error } = await supabase.rpc("rpc_upgrade_stat", { stat, levels: 1 } as any);
      if (error) throw new Error(error.message);
      await load();
    } catch (e:any) { setErr(e?.message ?? "Upgrade failed"); }
  }

  useEffect(()=>{ void load(); },[]);

  if (loading) return <main className="max-w-4xl mx-auto px-4 py-10">Loading…</main>;
  if (!me)      return <main className="max-w-4xl mx-auto px-4 py-10">No profile found.</main>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      <div className="grid md:grid-cols-[auto,1fr] gap-6 items-start">
        <NeonCard accent="purple">
          <div className="flex items-center gap-4">
            <NeonAvatar size={72}/>
            <div>
              <div className="neon-title">PLAYER</div>
              <div className="text-xl font-extrabold">You</div>
            </div>
          </div>
        </NeonCard>

        <div className="grid md:grid-cols-3 gap-6">
          <NeonCard accent="lime">
            <div className="neon-title">XP</div>
            <div className="mt-1 text-2xl font-extrabold">{me.xp.toLocaleString()}</div>
          </NeonCard>

          <NeonCard accent="pink">
            <div className="flex items-center justify-between">
              <div>
                <div className="neon-title">CREDITS</div>
                <div className="mt-1 text-2xl font-extrabold">{me.creds.toLocaleString()}</div>
              </div>
            </div>
          </NeonCard>

          <NeonCard title="SECURITY LEVEL" accent="cyan">
            <div className="grid place-items-center">
              <RadialGauge value={Math.min(100, me.sec_level)} reverse />
            </div>
          </NeonCard>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NeonCard title="HACKING LEVEL" accent="orange">
          <div className="flex items-center gap-4">
            <div className="w-24"><RadialGauge value={Math.min(100, me.hack_level)} reverse /></div>
            <div className="flex-1">
              <div className="neon-title mb-2">PROGRESS</div>
              <ProgressBar value={Math.min(100, me.hack_level)} height={12}/>
            </div>
            <button
              onClick={()=>void incStat("hack")}
              className="px-3 py-2 text-xs font-semibold rounded-lg
                         bg-white/10 hover:bg-white/20 border border-white/20">
              + Upgrade
            </button>
          </div>
        </NeonCard>

        <NeonCard title="BIO" accent="purple">
          <textarea
            className="w-full rounded-lg border border-white/15 bg-black/10 p-3 text-sm outline-none"
            rows={3}
            placeholder="Drop a scary line to warn hackers…"
            value={bio}
            onChange={(e)=>setBio(e.target.value)}
          />
          <button
            onClick={()=>void saveBio()}
            disabled={saving}
            className="mt-2 px-3 py-2 rounded-lg text-sm font-semibold
                       bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50">
            {saving? "Saving…" : "Save bio"}
          </button>
        </NeonCard>
      </div>

      <NeonCard title="ACTIVE EFFECTS" accent="cyan">
        {effects.length === 0 ? (
          <div className="text-sm opacity-80">No active effects.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e)=>(
              <li key={e.id} className="rounded-xl p-3 bg-white/5 border border-white/10">
                <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                <div className="text-xs opacity-80">{e.effect}</div>
                <div className="mt-2">
                  {/* reversed: full (green) → empty (red) as time runs out */}
                  <ProgressBar value={Math.max(0, Math.min(100, effectPct(e)))} reverse height={10}/>
                </div>
              </li>
            ))}
          </ul>
        )}
      </NeonCard>
    </main>
  );
}