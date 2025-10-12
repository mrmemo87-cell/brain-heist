"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import { ProgressBar } from "@/components/ProgressBar";

type UserRow = {
  uid: string;
  username?: string | null;
  xp?: number | null;
  creds?: number | null;
  hack_skill?: number | null;
  security_level?: number | null;
  streak_days?: number | null;
  bio?: string | null;
};

type EffectRow = {
  id: number;
  user_id: string;
  item_key: string;
  effect: string;
  started_at: string;
  expires_at: string | null;
  duration_seconds: number;
};

function secsLeft(e: EffectRow) {
  const end = e.expires_at ? new Date(e.expires_at).getTime() : 0;
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

export default function ProfilePage() {
  const [me, setMe] = useState<UserRow | null>(null);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [effects, setEffects] = useState<EffectRow[]>([]);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) { setErr("Not signed in"); return; }

      // user
      const { data: u } = await supabase.from("users")
        .select("uid,username,xp,creds,hack_skill,security_level,streak_days,bio")
        .eq("uid", uid).maybeSingle();
      if (u) { setMe(u as any); setBio((u as any).bio ?? ""); }

      // active effects (only those not expired)
      const { data: fx } = await supabase.from("active_effects")
        .select("id,user_id,item_key,effect,started_at,expires_at,duration_seconds")
        .eq("user_id", uid)
        .order("expires_at", { ascending: false });
      const alive = (fx ?? []).filter(e => secsLeft(e as any) > 0) as EffectRow[];
      setEffects(alive);
    })();
  }, []);

  async function saveBio() {
    if (!me) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("users").update({ bio }).eq("uid", me.uid);
      if (error) throw error;
    } catch (e:any) {
      console.error(e);
      setErr(e?.message ?? "Failed to save bio");
    } finally {
      setSaving(false);
    }
  }

  const hack = Math.max(0, Math.min(100, (me?.hack_skill as any) ?? 0));
  const sec = Math.max(0, Math.min(100, (me?.security_level as any) ?? 0));
  const streak = Math.max(0, Math.min(30, (me?.streak_days as any) ?? 0));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      {/* Header card */}
      <section className="rounded-3xl p-6 bg-[var(--c-card)]/70 border border-white/10 shadow-[0_0_30px_rgba(168,85,247,.25)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold drop-shadow-[0_0_10px_rgba(34,197,94,.35)]">{me?.username ?? "You"}</div>
            <div className="text-xs opacity-70 mt-1">Rank 0 • Squad: A</div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/10 ring-1 ring-cyan-400/40 text-cyan-200
                             drop-shadow-[0_0_10px_rgba(34,211,238,.55)] text-sm">
              ✨ {me?.xp ?? 0}
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 ring-1 ring-amber-400/40 text-amber-200
                             drop-shadow-[0_0_10px_rgba(251,191,36,.55)] text-sm">
              🪙 {me?.creds ?? 0}
            </span>
          </div>
        </div>
      </section>

      {/* Powers */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
          <div className="text-sm mb-1">Hack skill</div>
          <ProgressBar value={hack/100} className="mt-1" />
          <div className="text-[11px] opacity-60 mt-1">{hack}/100</div>
        </div>
        <div className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
          <div className="text-sm mb-1">Security level</div>
          <ProgressBar value={sec/100} className="mt-1" />
          <div className="text-[11px] opacity-60 mt-1">{sec}/100</div>
        </div>
        <div className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
          <div className="text-sm mb-1">Streak (days)</div>
          <ProgressBar value={streak/30} className="mt-1" />
          <div className="text-[11px] opacity-60 mt-1">{streak}/30</div>
        </div>
      </section>

      {/* Active Effects with reverse countdown */}
      <section className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
        <div className="text-lg font-semibold mb-3">Active Effects</div>
        {effects.length === 0 ? (
          <div className="text-sm opacity-70">No active items.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e) => {
              const left = secsLeft(e);
              const total = Math.max(1, e.duration_seconds);
              const ratio = left / total; // reverse progress bar
              const minutes = Math.floor(left / 60);
              const seconds = left % 60;
              return (
                <li key={e.id} className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{e.item_key.replace(/_/g," ")}</div>
                    <div className="text-xs opacity-70">
                      {minutes}:{String(seconds).padStart(2, "0")} left
                    </div>
                  </div>
                  <ProgressBar value={ratio} reverse className="h-3" />
                  <div className="text-[11px] opacity-60 mt-1">{e.effect}</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Bio editor */}
      <section className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
        <div className="text-lg font-semibold mb-2">Bio</div>
        <p className="text-xs opacity-70 mb-2">Drop a scary one-liner to keep hackers away 😈</p>
        <textarea
          value={bio}
          onChange={(e)=>setBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-black/20 border border-white/15 p-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400/40"
          placeholder="e.g. I collect failed hack logs for breakfast."
        />
        <div className="mt-2">
          <button
            disabled={bio === (me?.bio ?? "") || saving}
            onClick={saveBio}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-semibold
                       hover:opacity-90 disabled:opacity-50 drop-shadow-[0_0_18px_rgba(192,132,252,.45)]"
          >
            {saving ? "Saving…" : "Save Bio"}
          </button>
        </div>
      </section>
    </main>
  );
}
