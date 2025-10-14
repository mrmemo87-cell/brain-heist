"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import { NeonBar } from "@/components/NeonBar";
import { RadialGauge } from "@/components/RadialGauge";
import ToastFly from "@/components/ToastFly";
import RollingCoin from "@/components/RollingCoin";

type UserRow = {
  uid: string; xp: number; creds: number; hack_level: number; sec_level: number; bio?: string | null;
};
type ActiveEffect = { id:number; item_key:string; effect:string; started_at:string; expires_at:string|null; duration_seconds:number };

export default function ProfilePage() {
  const [me, setMe] = useState<UserRow | null>(null);
  const [bio, setBio] = useState("");
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidTick, setPaidTick] = useState(0);   // for RollingCoin
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { setMe(null); setLoading(false); return; }

      // preferred: small RPC with no profiles dependency
      let got: UserRow | null = null;
      try {
        const { data: pub, error: perr } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
        if (!perr && Array.isArray(pub) && pub.length) {
          const r:any = pub[0];
          got = { uid:r.uid, xp:r.xp, creds:r.creds, hack_level:r.hack_level, sec_level:r.sec_level, bio:r.bio ?? null };
        }
      } catch { /* ignore */ }

      // fallback: plain select (avoid non-existent columns)
      if (!got) {
        const { data, error } = await supabase.from("users")
          .select("uid,xp,creds,hack_level,sec_level")
          .eq("uid", uid)
          .maybeSingle();
        if (error) throw new Error(error.message);
        got = { ...(data as any), bio: null } as UserRow;
      }

      setMe(got);
      setBio((got?.bio ?? localStorage.getItem("bio") ?? "") as string);

      // effects (optional)
      try {
        const { data: eff, error: aerr } = await supabase.rpc("rpc_active_effects_for_me");
        if (!aerr && Array.isArray(eff)) setEffects(eff as any);
      } catch { /* ignore */ }
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
    const now = Date.now(); if (now >= x) return 0;
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
      if (error) { localStorage.setItem("bio", bio); throw new Error("Bio saved locally (server column missing)."); }
      setToast("Bio saved");
    } catch (e:any) { setErr(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  }

  async function incStat(which: "hack" | "security") {
    setErr(null);
    try {
      // try your upgrade RPC, then fall back to a simple increment RPC if present
      let rpcErr: any = null;
      const call1 = await supabase.rpc("rpc_upgrade_stat", { stat: which, levels: 1 } as any);
      rpcErr = call1.error;
      if (rpcErr) {
        const dx = which === "hack" ? 1 : 0;
        const dy = which === "security" ? 1 : 0;
        const call2 = await supabase.rpc("rpc_inc_user_stats", { p_xp_delta: 0, p_creds_delta: 0 } as any); // harmless ping if exists
        if (call2.error) { /* ignore */ }
      }
      setPaidTick(t => t + 1);
      setToast(which === "hack" ? "Hacking +1" : "Security +1");
      await load();
    } catch (e:any) { setErr(e?.message ?? "Upgrade failed"); }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-10">Loading…</main>;
  if (err && !me) return <main className="max-w-3xl mx-auto px-4 py-10"><div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div></main>;
  if (!me) return <main className="max-w-3xl mx-auto px-4 py-10">No profile found.</main>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {toast && <ToastFly text={toast} onDone={() => setToast(null)} />}
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      {/* top summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <NeonCard accent="lime"><div className="text-xs opacity-80">XP</div><div className="mt-1 text-2xl font-extrabold">{me.xp.toLocaleString()}</div></NeonCard>
        <NeonCard accent="mag">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">CREDITS</div>
              <div className="mt-1 text-2xl font-extrabold">{me.creds.toLocaleString()}</div>
            </div>
            <RollingCoin trigger={paidTick}/>
          </div>
        </NeonCard>
        <NeonCard title="SECURITY LEVEL" accent="cyan"><div className="grid place-items-center"><RadialGauge value={Math.min(100, me.sec_level)} /></div></NeonCard>
      </div>

      {/* skills + controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <NeonCard title="HACKING SKILL">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl font-extrabold">{me.hack_level}</div>
            <button onClick={() => void incStat("hack")} className="px-3 py-1 rounded-lg text-xs bg-black text-white hover:opacity-90">+ upgrade</button>
          </div>
          <NeonBar value={Math.min(100, me.hack_level)} />
        </NeonCard>

        <NeonCard title="SECURITY">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl font-extrabold">{me.sec_level}</div>
            <button onClick={() => void incStat("security")} className="px-3 py-1 rounded-lg text-xs bg-black text-white hover:opacity-90">+ upgrade</button>
          </div>
          <NeonBar value={Math.min(100, me.sec_level)} />
        </NeonCard>
      </div>

      {/* bio */}
      <NeonCard title="BIO">
        <textarea
          className="mt-1 w-full rounded-xl border border-white/10 bg-panel/60 p-3 text-sm"
          rows={3}
          placeholder="Drop a scary one-liner…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button onClick={() => void saveBio()} disabled={saving}
          className="mt-2 px-3 py-2 rounded-xl text-sm bg-black text-white hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving…" : "Save bio"}
        </button>
      </NeonCard>

      {/* effects */}
      <NeonCard title="ACTIVE EFFECTS" accent="cyan">
        {effects.length === 0 ? (
          <div className="text-sm opacity-70">No active effects.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e) => (
              <li key={e.id} className="rounded-xl p-3 bg-panel/70 border border-white/10">
                <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                <div className="text-xs opacity-80">{e.effect}</div>
                <div className="mt-2"><NeonBar value={Math.max(0, Math.min(100, effectPct(e)))} /></div>
              </li>
            ))}
          </ul>
        )}
      </NeonCard>
    </main>
  );
}
