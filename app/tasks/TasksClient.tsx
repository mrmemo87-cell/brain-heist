"use client";

import { useEffect, useMemo, useState, startTransition, memo } from "react";
import { Virtuoso } from "react-virtuoso";
import { supabase } from "@/lib/supa";

type Task = {
  created_at: string;
  prompt?: string;
  options_raw?: any;
  answer?: number | string;   // 1-based index (e.g., 2 => option B)
  xp?: number | string;
  creds?: number | string;    // coins
  active?: any;
  // local view state:
  _picked?: number | null;
  _correct?: boolean | null;
};

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
    // {A,B,C,D}
    if (s.startsWith("{") && s.endsWith("}")) {
      s = s.slice(1, -1);
      return s.split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    }
    // JSON-ish
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const j = JSON.parse(s);
        if (Array.isArray(j)) return j.map(String);
        if (j?.options) return j.options.map(String);
      } catch {}
    }
    // fallback separators
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

// bump header immediately + persist in background
function bumpAndPersist(xpDelta: number, credsDelta: number) {
  try {
    // AppHeader listens for this and animates counts
    window.dispatchEvent(new CustomEvent("stats:delta", { detail: { xpDelta, credsDelta } }));
  } catch {}
  // atomic server-side increment; don’t await (keep UI snappy)
  void supabase.rpc("rpc_inc_user_stats", { dxp: xpDelta, dcreds: credsDelta });
}

export default function TasksClient({ initialTasks = [] as Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // load latest questions (active only)
  useEffect(() => {
    (async () => {
      setErr(null); setLoading(true);
      const { data, error } = await supabase
        .from("questions_import2")
        .select("prompt,options_raw,answer,xp,creds,active,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const rows = (data ?? []).filter((r: any) => isActive(r.active)) as Task[];
      setTasks(rows);
      setLoading(false);
    })();
  }, []);

  // submit handler used by TaskRow
  async function handleAnswer(idx: number, choice: number, opts: string[], t: Task) {
    // already answered?
    if (tasks[idx]?._picked !== undefined && tasks[idx]?._picked !== null) return;

    const gainXp = toNum(t.xp);
    const gainCreds = toNum(t.creds);
    const right = choice === correctIdx(t.answer, opts.length);
    const xpDelta = right ? gainXp : 0;
    const credsDelta = right ? gainCreds : -Math.max(1, Math.ceil(gainCreds / 2));

    // 1) update local state fast
    startTransition(() => {
      setTasks((prev) => {
        const next = [...prev];
        next[idx] = { ...t, _picked: choice, _correct: right };
        return next;
      });
    });

    // 2) instant header bump + background DB persist
    bumpAndPersist(xpDelta, credsDelta);

    // 3) optional: store answer (no FK assumptions)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const answerText = opts[choice] ?? String(choice);
      await supabase.from("answers").insert({
        user_id: user?.id ?? null,
        answer: answerText,
      });
    } catch {}
  }

  if (loading) return <main className="min-h-[60vh] grid place-items-center text-sm opacity-70">Loading…</main>;
  if (err) return <main className="p-6 text-red-500">Error: {err}</main>;

  return (
    <main className="p-6">
      <Virtuoso
        style={{ height: "calc(100vh - 140px)" }}
        data={tasks}
        itemContent={(index, t) => <TaskRow task={t} index={index} onAnswer={handleAnswer} />}
      />
    </main>
  );
}

// ---- row (memoized to avoid re-render storms) ----
const TaskRow = memo(function TaskRow({
  task,
  index,
  onAnswer,
}: {
  task: Task;
  index: number;
  onAnswer: (idx: number, choice: number, opts: string[], t: Task) => void;
}) {
  const opts = useMemo(() => parseOptions(task.options_raw), [task.options_raw]);
  const cIdx = useMemo(() => correctIdx(task.answer, opts.length), [task.answer, opts.length]);
  const picked = task._picked ?? null;
  const right = task._correct ?? null;

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-zinc-900/70">
      <div className="text-[11px] opacity-60 mb-2">
        {new Date(task.created_at).toLocaleString()}
      </div>
      <div className="text-base font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
        {task.prompt ?? "(no prompt)"}
      </div>

      <div className="grid gap-2">
        {opts.map((opt, i) => {
          const show = picked !== null;
          const isPick = picked === i;
          const isRight = cIdx === i;
          let cls = "text-left rounded-xl border px-4 py-3 transition shadow-sm select-none text-neutral-900 dark:text-neutral-100";
          if (!show) cls += " bg-white hover:bg-black/[0.04] dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer";
          else if (isPick && isRight) cls += " bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30";
          else if (isPick && !isRight) cls += " bg-rose-50 border-rose-400 dark:bg-rose-900/30";
          else if (isRight) cls += " bg-emerald-50/60 border-emerald-300 dark:bg-emerald-900/20";
          else cls += " bg-white dark:bg-white/10";

          return (
            <button
              key={i}
              className={cls}
              disabled={show}
              onClick={() => onAnswer(index, i, opts, task)}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs text-neutral-700 dark:text-neutral-200">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={"mt-3 text-sm " + (right ? "text-emerald-600" : "text-rose-600")}>
          {right
            ? `Correct! +${toNum(task.xp)} xp, +${toNum(task.creds)} creds`
            : `Oops! -${Math.max(1, Math.ceil(toNum(task.creds) / 2))} creds`}
        </div>
      )}
    </div>
  );
});
