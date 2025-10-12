"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import { ProgressBar } from "@/components/ProgressBar";

type UserRow = Record<string, any>;

type EffectRow = {
  id: number;
  user_id: string;
  item_key: string;
  effect: string;
  started_at: string;
  expires_at: string | null;
  duration_seconds: number;
};

const secsLeft = (e: EffectRow) => {
  const end = e.expires_at ? new Date(e.expires_at).getTime() : 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
};

// pick first present numeric field
function pickNum(obj: any, keys: string[], fallback = 0) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) {
      const n = Number(obj[k]);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

export default function ProfilePage() {
  const [me, setMe] = useState<UserRow | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [bio, setBio] = useState("");
  const [effects, setEffects] = useState<EffectRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      const { data: { user }, error: aerr } = await supabase.auth.getUser();
      if (aerr) { setErr(aerr.message); return; }
      const uid = user?.id;
      if (!uid) { setErr("Not signed in"); return; }

      const fallback =
        (user?.user_metadata as any)?.name ??
        (user?.user_metadata as any)?.username ??
        (user?.email?.split("@")[0]) ??
        "You";
      setDisplayName(fallback);

      // ✅ request ALL columns to avoid “column does not exist” errors
      const { data: u, error: uerr } = await supabase
        .from("users")
        .select("*")
        .eq("uid", uid)
        .maybeSingle();
      if (uerr) setErr(uerr.message);
      if (u) { setMe(u as any); setBio((u as any).bio ?? ""); }

      const { data: fx } = await supabase
        .from("active_effects")
        .select("id,user_id,item_key,effect,started_at,expires_at,duration_seconds")
        .eq("user_id", uid)
        .order("expires_at", { ascending: false });
      setEffects((fx ?? []).filter(e => secsLeft(e as any) > 0) as any);
    })();
  }, []);

  async function saveBio() {
    if (!me) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("users").update({ bio }).eq("uid", me.uid);
      if (error) throw error;
    } catch (e:any) { setErr(e?.message ?? "Failed to save bio"); }
    finally { setSaving(false); }
  }

  // Safely derive numbers from whatever fields exist
  const xp    = pickNum(me, ["xp"]);
  const creds = pickNum(me, ["creds","coins"]);
  const hack  = pickNum(me, ["hack_skill","hack","skill","hacklevel","hack_level"], 0);
  const sec   = pickNum(me, ["security_level","security","defense","shield_level"], 0);
  const streak= pickNum(me, ["streak_days","streak","streakdays"], 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {err && <div className="text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3">{err}</div>}

      <section className="card rounded-3xl p-6 shadow-[0_10px_40px_rgba(2,132,199,.15)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{displayName}</div>
            <div className="text-xs text-[var(--c-muted)] mt-1">Rank 0 • Squad: A</div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm">✨ {xp}</span>
            <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">🪙 {creds}</span>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm mb-1">Hack skill</div>
          <ProgressBar value={Math.min(1, Math.max(0, hack/100))} className="mt-2" />
          <div className="text-[11px] text-[var(--c-muted)] mt-1">{hack}/100</div>
        </div>
        <div className="card p-4">
          <div className="text-sm mb-1">Security level</div>
          <ProgressBar value={Math.min(1, Math.max(0, sec/100))} className="mt-2" />
          <div className="text-[11px] text-[var(--c-muted)] mt-1">{sec}/100</div>
        </div>
        <div className="card p-4">
          <div className="text-sm mb-1">Streak (days)</div>
          <ProgressBar value={Math.min(1, Math.max(0, streak/30))} className="mt-2" />
          <div className="text-[11px] text-[var(--c-muted)] mt-1">{streak}/30</div>
        </div>
      </section>

      <section className="card p-4">
        <div className="text-lg font-semibold mb-3">Active Effects</div>
        {effects.length === 0 ? (
          <div className="text-sm text-[var(--c-muted)]">No active items.</div>
        ) : (
          <ul className="space-y-3">
            {effects.map((e) => {
              const left = secsLeft(e as any);
              const total = Math.max(1, (e as any).duration_seconds);
              const ratio = left / total;
              const m = Math.floor(left/60), s = left%60;
              return (
                <li key={(e as any).id} className="p-3 rounded-xl border border-[var(--c-border)] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{(e as any).item_key.replace(/_/g," ")}</div>
                    <div className="text-xs text-[var(--c-muted)]">{m}:{String(s).padStart(2,"0")} left</div>
                  </div>
                  <ProgressBar value={ratio} reverse className="h-3" />
                  <div className="text-[11px] text-[var(--c-muted)] mt-1">{(e as any).effect}</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <div className="text-lg font-semibold mb-2">Bio</div>
        <p className="text-xs text-[var(--c-muted)] mb-2">Drop a scary one-liner to keep hackers away 😈</p>
        <textarea
          value={bio}
          onChange={(e)=>setBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-white border border-[var(--c-border)] p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300"
          placeholder="e.g. I collect failed hack logs for breakfast."
        />
        <div className="mt-2">
          <button
            disabled={saving || bio === (me?.bio ?? "")}
            onClick={async()=>{
              if (!me) return;
              setSaving(true);
              try {
                const { error } = await supabase.from("users").update({ bio }).eq("uid", me.uid);
                if (error) throw error;
              } finally { setSaving(false); }
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-black font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Bio"}
          </button>
        </div>
      </section>
    </main>
  );
}
