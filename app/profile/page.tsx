"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import ProgressBar from "@/components/ProgressBar";
import RadialGauge from "@/components/RadialGauge";
import NeonAvatar from "@/components/NeonAvatar";

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
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hackingAnim, setHackingAnim] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { setMe(null); setLoading(false); return; }

      // prefer rpc_profile_public if present
      let got: UserRow | null = null;
      try {
        const { data: pub, error: perr } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
        if (!perr && Array.isArray(pub) && pub.length) {
          const r: any = pub[0];
          got = { uid: r.uid, xp: r.xp, creds: r.creds, hack_level: r.hack_level, sec_level: r.sec_level, bio: r.bio ?? null };
        }
      } catch { /* ignore */ }

      if (!got) {
        const { data, error } = await supabase.from("users").select("uid,xp,creds,hack_level,sec_level").eq("uid", uid).maybeSingle();
        if (error) throw new Error(error.message);
        got = { ...(data as any), bio: null } as UserRow;
      }

      setMe(got);
      if (typeof window !== "undefined") {
        setBio((got?.bio ?? localStorage.getItem("bio") ?? "") as string);
      }

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
    const s = new Date(e.started_at).getTime();
    const x = new Date(e.expires_at).getTime();
    const now = Date.now();
    if (now >= x) return 0;
    const total = Math.max(1, x - s);
    const left = Math.max(0, x - now);
    return Math.round((left / total) * 100);
  }

  function xpToRank(xp: number) {
    if (xp > 3000) return "Legend";
    if (xp > 1500) return "Elite";
    if (xp > 500) return "Pro";
    return "Rookie";
  }

  async function doHack() {
    // show devilish glitch animation
    setHackingAnim(true);
    setTimeout(() => setHackingAnim(false), 1200);
    // attempt RPC /server action (non-blocking)
    try {
      await supabase.rpc("rpc_try_hack"); // optional, depends on your backend
    } catch {}
    // reload stats after short delay
    setTimeout(() => void load(), 900);
  }

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-10">Loading…</main>;
  if (!me) return <main className="max-w-3xl mx-auto px-4 py-10">No profile found.</main>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      <section className="grid md:grid-cols-3 gap-6 items-start">
        <div className="col-span-1">
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-white/6">
            <NeonAvatar size={180} xp={me.xp} />
            <div className="mt-4 text-center">
              <div className="text-lg font-extrabold">{me.uid?.slice(0,12)}</div>
              <div className="text-xs opacity-80">Rank: {xpToRank(me.xp)}</div>
            </div>
          </div>
        </div>

        <div className="col-span-2 grid gap-4">
          <div className="grid md:grid-cols-3 gap-6">
            <NeonCard title="XP" accent="lime"><div className="text-2xl font-extrabold">{me.xp.toLocaleString()}</div></NeonCard>
            <NeonCard title="CREDITS" accent="mag"><div className="text-2xl font-extrabold">{me.creds.toLocaleString()}</div></NeonCard>
            <NeonCard title="SECURITY LEVEL" accent="cyan">
              <div className="grid place-items-center">
                <RadialGauge value={Math.min(100, me.sec_level)} reverse />
              </div>
            </NeonCard>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <NeonCard title="HACKING LEVEL" accent="pink">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80">Hacking</div>
                  <div className="mt-1 text-2xl font-extrabold">{me.hack_level}</div>
                </div>
                <button onClick={() => void doHack()}
                  className={`px-3 py-2 rounded-md text-sm font-bold shadow-neon hover:brightness-105 transition-transform ${hackingAnim ? "animate-hack-glitch" : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"}`}>
                  😈 Hack
                </button>
              </div>
            </NeonCard>

            <NeonCard title="Active Effects" accent="purple">
              {effects.length === 0 ? (
                <div className="text-sm opacity-70">No active effects</div>
              ) : (
                <ul className="space-y-3">
                  {effects.map((e) => (
                    <li key={e.id} className="rounded-xl p-3 bg-[rgba(255,255,255,0.02)] border border-white/6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold">🔮 {e.item_key}</div>
                          <div className="text-xs opacity-80">{e.effect}</div>
                        </div>
                        <div style={{width:160}}>
                          <ProgressBar value={effectPct(e)} reverse height={10} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </NeonCard>
          </div>

          <NeonCard title="Bio" accent="mag">
            <textarea className="w-full rounded-md p-3 bg-[rgba(255,255,255,0.01)] border border-white/6" rows={3} value={bio} onChange={(e)=>setBio(e.target.value)} />
            <div className="mt-3">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold">Save bio</button>
            </div>
          </NeonCard>
        </div>
      </section>
    </main>
  );
}