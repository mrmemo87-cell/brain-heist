"use client";

import { useEffect, useMemo, useState, startTransition } from "react";
import { supabase } from "@/lib/supa";

type Task = {
  created_at: string;
  prompt?: string;
  options_raw?: any;
  answer?: number | string;   // 1-based index (2 => B)
  xp?: number | string;
  creds?: number | string;    // coins
  active?: any;
};

const INTERLUDE_EVERY = 5; // show an interlude after every N questions

// ===== helpers =====
const isActive = (v: any) =>
  v === true || String(v).toLowerCase() === "true" || Number(v) === 1;

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function parseOptions(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    let s = raw.trim();
    if (s.startsWith("{") && s.endsWith("}")) {
      s = s.slice(1, -1);
      return s.split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    }
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const j = JSON.parse(s);
        if (Array.isArray(j)) return j.map(String);
        if (j?.options) return j.options.map(String);
      } catch {}
    }
    if (s.includes("|")) return s.split("|").map((x) => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return s ? [s] : [];
  }
  return [];
}

function correctIdx(answer: number | string | undefined, total: number): number {
  const n = toNum(answer);
  if (!n) return -1;
  const z = Math.max(0, Math.floor(n) - 1);
  return z < total ? z : -1;
}

// instantly bump header + persist in background
function bumpAndPersist(xpDelta: number, credsDelta: number) {
  try {
    window.dispatchEvent(new CustomEvent("stats:delta", { detail: { xpDelta, credsDelta } }));
  } catch {}
  void supabase.rpc("rpc_inc_user_stats", { dxp: xpDelta, dcreds: credsDelta });
}

// ===== pixel loader =====
function PixelLoader() {
  return (
    <div className="grid place-items-center py-10">
      <div className="pixel-loader">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="pixel" style={{ animationDelay: `${(i % 3) * 90}ms` }} />
        ))}
      </div>
      <div className="mt-3 text-[11px] tracking-widest opacity-70">LOADING…</div>
      <style jsx>{`
        .pixel-loader {
          width: 48px;
          height: 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
        }
        .pixel {
          width: 12px;
          height: 12px;
          background: #111;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset;
          animation: blink 650ms steps(2, end) infinite;
        }
        :global(.dark) .pixel { background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.15) inset; }
        @keyframes blink {
          0% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ===== interlude card (you can edit the content!) =====
function InterludeCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="rounded-2xl border shadow-xl bg-[var(--c-card)]/70 p-6 animate-cardIn">
      <div className="text-xs opacity-60 mb-2">Interlude</div>
      <div className="text-lg font-semibold mb-3">Take a tiny brain break 🧠✨</div>
      <div className="rounded-xl overflow-hidden border">
        {/* Swap this placeholder image with your meme/joke image */}
        <img
          src="/memes/placeholder.jpg"
          alt="meme placeholder"
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="text-xs opacity-70 mt-2">
        Replace <code className="px-1 rounded bg-black/10 dark:bg-white/10">/public/memes/placeholder.jpg</code> with your meme.
      </div>
      <div className="mt-4">
        <button className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
          onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ===== main =====
export default function TasksClient() {
  const [rows, setRows] = useState<Task[]>([]);
  const [i, setI] = useState(0);                // question index
  const [phase, setPhase] = useState<"question"|"loader"|"interlude"|"done">("question");
  const [picked, setPicked] = useState<number|null>(null);
  const [isRight, setIsRight] = useState<boolean|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      setErr(null); setLoading(true);
      const { data, error } = await supabase
        .from("questions_import2")
        .select("prompt,options_raw,answer,xp,creds,active,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) { setErr(error.message); setLoading(false); return; }
      const list = (data ?? []).filter((r: any) => isActive(r.active)) as Task[];
      setRows(list);
      setLoading(false);
      setPhase(list.length ? "question" : "done");
    })();
  }, []);

  const q = rows[i];
  const opts = useMemo(() => parseOptions(q?.options_raw), [q]);
  const cIdx = useMemo(() => correctIdx(q?.answer, opts.length), [q, opts]);

  function submit(choice: number) {
    if (picked !== null || !q) return;
    const gainXp = toNum(q.xp), gainCreds = toNum(q.creds);
    const ok = choice === cIdx;
    const xpDelta = ok ? gainXp : 0;
    const credsDelta = ok ? gainCreds : -Math.max(1, Math.ceil(gainCreds / 2));

    startTransition(() => { setPicked(choice); setIsRight(ok); });
    // instant header tick + background persist
    bumpAndPersist(xpDelta, credsDelta);
  }

  function next() {
    // small loader between cards
    setPhase("loader");
    setPicked(null); setIsRight(null);
    setTimeout(() => {
      const nextIndex = i + 1;
      // interlude after every INTERLUDE_EVERY cards
      if (nextIndex > 0 && nextIndex % INTERLUDE_EVERY === 0) {
        setI(nextIndex);
        setPhase("interlude");
      } else if (nextIndex >= rows.length) {
        setI(nextIndex);
        setPhase("done");
      } else {
        setI(nextIndex);
        setPhase("question");
      }
    }, 500); // quick pixel loader
  }

  if (loading) return <main className="min-h-[60vh] grid place-items-center text-sm opacity-70">Loading…</main>;
  if (err) return <main className="p-6 text-rose-500">Error: {err}</main>;
  if (!rows.length) return <main className="p-10 grid place-items-center opacity-70">No questions yet.</main>;
  if (phase === "done") return <main className="p-10 grid place-items-center">
    <div className="rounded-2xl border bg-[var(--c-card)]/70 p-8 text-center animate-cardIn">
      <div className="text-2xl font-bold mb-2">All done 🎉</div>
      <button className="rounded-xl bg-black text-white px-4 py-2" onClick={() => { setI(0); setPhase("question"); }}>
        Restart
      </button>
    </div>
  </main>;

  return (
    <main className="min-h-[100vh]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {phase === "loader" && <PixelLoader />}

        {phase === "interlude" && (
          <div className="animate-cardIn">
            <InterludeCard onContinue={() => setPhase(i >= rows.length ? "done" : "question")} />
          </div>
        )}

        {phase === "question" && q && (
          <div className="rounded-2xl border shadow-xl bg-white dark:bg-zinc-900/70 p-6 animate-cardIn">
            <div className="text-[11px] opacity-60 mb-2">{new Date(q.created_at).toLocaleString()}</div>
            <div className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">{q.prompt ?? "(no prompt)"}</div>

            <div className="grid gap-2">
              {opts.map((opt, idx) => {
                const show = picked !== null;
                const isPick = picked === idx;
                const right = cIdx === idx;
                let cls = "text-left rounded-xl border px-4 py-3 transition shadow-sm select-none text-neutral-900 dark:text-neutral-100";
                if (!show) cls += " bg-white hover:bg-black/[0.04] dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer";
                else if (isPick && right) cls += " bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30";
                else if (isPick && !right) cls += " bg-rose-50 border-rose-400 dark:bg-rose-900/30";
                else if (right) cls += " bg-emerald-50/60 border-emerald-300 dark:bg-emerald-900/20";
                else cls += " bg-white dark:bg-white/10";

                return (
                  <button key={idx} className={cls} disabled={show} onClick={() => submit(idx)}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border text-[11px] font-mono text-neutral-700 dark:text-neutral-200">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className={"mt-4 text-sm " + (isRight ? "text-emerald-600" : "text-rose-600")}>
                {isRight
                  ? `Correct! +${toNum(q.xp)} xp, +${toNum(q.creds)} creds`
                  : `Oops! -${Math.max(1, Math.ceil(toNum(q.creds) / 2))} creds`}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="rounded-xl border px-3 py-1.5" onClick={() => { setPicked(null); setIsRight(null); }} disabled={picked === null}>
                Change
              </button>
              <button className="rounded-xl bg-black text-white px-3 py-1.5" onClick={next} disabled={picked === null}>
                Next
              </button>
            </div>
            <div className="mt-4 text-[11px] opacity-60">source: public.questions_import2 • batch ignored</div>
          </div>
        )}
      </div>

      {/* entry animation */}
      <style jsx>{`
        .animate-cardIn {
          animation: cardIn 380ms cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(6px) scale(.99); filter: saturate(.7) }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: saturate(1) }
        }
      `}</style>
    </main>
  );
}
