"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supa";
import { motion, AnimatePresence } from "framer-motion";

type QRow = {
  prompt?: string;
  options_raw?: any;
  answer?: number | string;      // 1-based index
  xp?: number | string;
  creds?: number | string;
  active?: boolean | string | number;
  created_at?: string;
  [k: string]: any;
};

function parseOptions(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map(String);

  if (typeof raw === "string") {
    let s = raw.trim();
    // braces: {A,B,C}
    if (s.startsWith("{") && s.endsWith("}")) {
      s = s.slice(1, -1);
      return s.split(",").map(x => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    }
    // JSON: ["A","B","C"]  or  { options: [...] }
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const j = JSON.parse(s);
        if (Array.isArray(j)) return j.map(String);
        if (j && Array.isArray((j as any).options)) return (j as any).options.map(String);
      } catch { /* ignore */ }
    }
    // CSV / pipes
    if (s.includes("|")) return s.split("|").map(x => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
    return s ? [s] : [];
  }
  return [];
}

function truthy(v: any) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}

export default function TasksClient() {
  const [rows, setRows] = useState<QRow[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // scoreboard
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [creds, setCreds] = useState(0);

  // per-question UI state
  const [picked, setPicked] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    (async () => {
      // fetch ONLY the columns we use; IGNORE batch entirely
      const { data, error } = await supabase
        .from("questions_import2")
        .select("prompt,options_raw,answer,xp,creds,active,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) { setErr(error.message); setLoading(false); return; }

      const filtered = (data ?? []).filter(r => truthy((r as QRow).active));
      setRows(filtered as QRow[]);
      setLoading(false);
    })();
  }, []);

  const current = rows[idx] ?? null;

  const options = useMemo(() => parseOptions(current?.options_raw), [current]);
  const correctIdx = useMemo(() => {
    const a = current?.answer;
    if (a == null) return -1;
    const n = Number(a);
    if (!Number.isFinite(n)) return -1;
    const zero = Math.max(0, Math.floor(n) - 1); // 1-based -> 0-based
    return zero < options.length ? zero : -1;
  }, [current, options]);

  const rewardXp = Number(current?.xp ?? 0) || 0;
  const rewardCreds = Number(current?.creds ?? 0) || 0;

  function onPick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const good = i === correctIdx;
    setIsCorrect(good);

    if (good) {
      setCoins(c => c + rewardCreds);
      setXp(x => x + rewardXp);
      setCreds(c => c + rewardCreds);
    } else {
      const penalty = Math.max(1, Math.ceil(rewardCreds / 2));
      setCoins(c => c - penalty);
    }

    setBurstKey(k => k + 1); // re-trigger confetti
  }

  function next() {
    setPicked(null);
    setIsCorrect(null);
    setIdx(i => Math.min(i + 1, rows.length)); // can go 1 past end -> "done"
  }

  if (loading) return <main className="min-h-[60vh] grid place-items-center text-sm opacity-70">Loading…</main>;
  if (err) return <main className="p-6 text-red-500">Error: {err}</main>;
  if (!current) {
    return (
      <main className="p-8 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">All done 🎉</div>
          <div className="opacity-70 mb-4">coins {coins} • xp {xp} • creds {creds}</div>
          <button
            className="rounded-xl bg-black text-white px-4 py-2 shadow hover:scale-[1.02] active:scale-95 transition"
            onClick={() => { setIdx(0); setCoins(0); setXp(0); setCreds(0); }}
          >
            Restart
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100vh] bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* HUD */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/60 dark:bg-black/30 border-b border-black/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between text-xs">
          <div className="opacity-70">question {idx+1}/{rows.length}</div>
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-black/80 text-white">coins {coins}</div>
            <div className="px-2 py-1 rounded bg-emerald-600/90 text-white">xp {xp}</div>
            <div className="px-2 py-1 rounded bg-indigo-600/90 text-white">creds {creds}</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative rounded-2xl border border-black/10 shadow-xl bg-white/80 dark:bg-zinc-900/60 p-6 overflow-hidden"
          >
            {/* confetti burst */}
            {picked !== null && (
              <ConfettiBurst key={burstKey} ok={!!isCorrect} />
            )}

            <div className="text-lg font-semibold mb-4">
              {current?.prompt ?? "(no prompt)"}
            </div>

            <div className="grid gap-2">
              {options.length === 0 ? (
                <div className="text-sm opacity-60">No options found in <code>options_raw</code>.</div>
              ) : options.map((opt, i) => {
                  const show = picked !== null;
                  const isPick = picked === i;
                  const isRight = correctIdx === i;

                  let base = "text-left rounded-xl border px-4 py-3 transition shadow-sm";
                  if (!show) base += " bg-white/70 hover:bg-black/[0.04] dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer";
                  else if (isPick && isRight) base += " bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30";
                  else if (isPick && !isRight) base += " bg-rose-50 border-rose-400 dark:bg-rose-900/30";
                  else if (isRight) base += " bg-emerald-50/60 border-emerald-300 dark:bg-emerald-900/20";
                  else base += " bg-white/60 dark:bg-white/5";

                  return (
                    <motion.button
                      key={i}
                      whileTap={!show ? { scale: 0.98 } : {}}
                      className={base}
                      disabled={show}
                      onClick={() => onPick(i)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </div>
                    </motion.button>
                  );
              })}
            </div>

            {/* result + controls */}
            <AnimatePresence>
              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 flex items-center justify-between"
                >
                  <div className={"text-sm " + (isCorrect ? "text-emerald-600" : "text-rose-600")}>
                    {isCorrect ? `Correct! +${rewardXp} xp, +${rewardCreds} creds` : `Oops! -${Math.max(1, Math.ceil(rewardCreds/2))} coins`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border px-3 py-1.5 hover:bg-black/5"
                      onClick={() => { setPicked(null); setIsCorrect(null); }}
                    >
                      Change
                    </button>
                    <button
                      className="rounded-xl bg-black text-white px-3 py-1.5 hover:opacity-90"
                      onClick={next}
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 text-[11px] opacity-60">source: public.questions_import2 • ignores <code>batch</code></div>
      </div>
    </main>
  );
}

/** tiny confetti burst (no libs) */
function ConfettiBurst({ ok }: { ok: boolean }) {
  const pieces = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = 50 + (i - 7) * 5; // spread
        const delay = i * 0.02;
        const color = ok ? "bg-emerald-500" : "bg-rose-500";
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0, x: "-50%" }}
            animate={{ opacity: [0, 1, 0], y: -120 - Math.random()*60 }}
            transition={{ duration: 0.9 + Math.random()*0.3, delay }}
            className={"absolute top-10 h-2 w-2 rounded-sm " + color}
            style={{ left: left + "%" }}
          />
        );
      })}
    </div>
  );
}
