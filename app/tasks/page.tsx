"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import { parseOptions, toInt } from "@/lib/qutil";

type Q = {
  prompt: string;
  options_raw?: any;
  answer?: number | null;   // 1-based
  xp?: number | null;
  creds?: number | null;
  created_at?: string | null;
  active?: boolean | null;
};

const INTERLUDE_EVERY = 5;
const MEMES = Array.from({length: 10}, (_,i) => `/memes/meme-${String(i+1).padStart(2,"0")}.webp`);
const WRONG_XP_PCT = 0.5;
const WRONG_COINS_PCT = 0.5;

export default function TasksPage() {
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{xp:number, coins:number, key:number}|null>(null);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions_import2")
        .select("prompt,options_raw,answer,xp,creds,created_at,active")
        .eq("active", true)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) setErr(error.message);
      setQs((data ?? []) as Q[]);
      setLoading(false);
    })();
  }, []);

  const current = qs[i];
  const options = useMemo(() => parseOptions(current?.options_raw), [current?.options_raw]);
  const correctIndex = Math.max(0, toInt(current?.answer, 1) - 1);
  const xp    = Math.max(0, toInt(current?.xp, 0));
  const coins = Math.max(0, toInt(current?.creds, 0));
  const showInterlude = useMemo(() => i > 0 && i % INTERLUDE_EVERY === 0, [i]);

  async function award(isCorrect: boolean) {
    const xpDelta = isCorrect ? xp : -Math.round(xp * WRONG_XP_PCT);
    const cDelta  = isCorrect ? coins : -Math.round(coins * WRONG_COINS_PCT);
    if (xpDelta === 0 && cDelta === 0) return;
    const { error } = await supabase.rpc("rpc_inc_user_stats", {
      p_xp_delta: xpDelta,
      p_creds_delta: cDelta,
    } as any);
    if (error) throw error;
    // local rolling coin/xp toast
    setToast({ xp: xpDelta, coins: cDelta, key: Math.random() });
    setTimeout(() => setToast(null), 1100);
  }

  async function pick(idx: number) {
    if (busy) return;
    setBusy(true);
    try {
      const ok = idx === correctIndex;
      await award(ok);
      setTimeout(() => setI(p => Math.min(p + 1, Math.max(0, qs.length - 1))), 650);
    } catch (e:any) {
      setErr(e?.message ?? "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <LoadingDots />
        <div className="mt-3"><SkeletonCard /></div>
      </main>
    );
  }
  if (!current) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="card p-6 text-center">
          <div className="text-lg font-semibold">You finished today’s questions 🎉</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {err && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{err}</div>}

      {/* interlude meme every N */}
      {showInterlude && MEMES.length > 0 && (
        <div className="card overflow-hidden animate-pop">
          <img
            src={MEMES[(Math.floor(i / INTERLUDE_EVERY)) % MEMES.length]}
            alt="interlude"
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>
      )}

      {/* question */}
      <section className="card p-4 sm:p-6 animate-rise">
        <div className="text-xs text-[var(--c-muted)] mb-2">Question {i + 1} of {qs.length}</div>
        <h2 className="text-lg font-semibold leading-snug">{current.prompt}</h2>

        <ul className="mt-4 space-y-3">
          {options.map((opt, idx) => (
            <li key={idx}>
              <button
                disabled={busy}
                onClick={() => void pick(idx)}
                className="btn-answer w-full text-left group"
              >
                <span className="chip">{String.fromCharCode(65 + idx)}</span>
                <span className="align-middle">{opt || <span className="opacity-50">—</span>}</span>
                <span className="float-right opacity-0 group-hover:opacity-100 transition">⚡</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="badge-cyan">xp {xp}</span>
          <span className="badge-amber">coins {coins}</span>
        </div>
      </section>

      {/* rolling coin/xp toast */}
      {toast && (
        <div key={toast.key} className="delta-toast">
          <span className={toast.xp >= 0 ? "delta up" : "delta down"}>✨ {toast.xp >= 0 ? "+" : ""}{toast.xp}</span>
          <span className={toast.coins >= 0 ? "delta up" : "delta down"}>
            <span className="coin" aria-hidden>🪙</span> {toast.coins >= 0 ? "+" : ""}{toast.coins}
          </span>
        </div>
      )}
    </main>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="pixel-dot" />
      <span className="pixel-dot" />
      <span className="pixel-dot" />
      <span className="ml-2">Loading…</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-4 sm:p-6">
      <div className="h-4 w-24 bg-black/10 rounded mb-3" />
      <div className="h-6 w-3/4 bg-black/10 rounded" />
      <div className="mt-4 space-y-3">
        {[0,1,2,3].map(i => <div key={i} className="h-12 bg-black/10 rounded" />)}
      </div>
    </div>
  );
}
