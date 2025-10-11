"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supa";

type Row = Record<string, any>;

function pickKey(cands: string[], obj: Row) {
  for (const k of cands) if (k in obj) return k;
  return "";
}

function coerceOptions(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map((v) => String(v));
  if (typeof raw === "string") {
    const s = raw.trim();
    // try JSON array first
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const j = JSON.parse(s);
        if (Array.isArray(j)) return j.map((v) => String(v));
        if (j && Array.isArray(j.options)) return j.options.map((v: any) => String(v));
      } catch {}
    }
    // CSV / pipe-delimited fallback
    if (s.includes("|")) return s.split("|").map((x) => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return s ? [s] : [];
  }
  return [];
}

function getCorrectIndex(row: Row, options: string[], correctKey: string) {
  if (!correctKey) return -1;
  const val = row[correctKey];
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    // numeric-as-string
    const n = Number(trimmed);
    if (!Number.isNaN(n)) return n;
    // match by option text
    const idx = options.findIndex((o) => o.toLowerCase() === trimmed.toLowerCase());
    return idx >= 0 ? idx : -1;
  }
  return -1;
}

export default function TasksClient() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null); // which option user picked
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // must be signed in if your RLS requires it
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data, error } = await supabase
        .from("questions_import2")
        .select("*")
        .limit(200);

      if (error) { setErr(error.message); setLoading(false); return; }
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [router]);

  const current = rows[i] || null;

  const meta = useMemo(() => {
    if (!current) return { idKey: "", promptKey: "", optionsKey: "", correctKey: "", options: [] as string[], correctIdx: -1 };
    const idKey      = pickKey(["id","qid","question_id","pk","_id"], current);
    const promptKey  = pickKey(["prompt","question","text","title","body"], current);
    const optionsKey = pickKey(["options","choices","answers","opts","variants"], current);
    const correctKey = pickKey(["correct","correct_index","answer_index","correctOption","correct_option","right","right_index"], current);
    const options    = coerceOptions(current[optionsKey]);
    const correctIdx = getCorrectIndex(current, options, correctKey);
    return { idKey, promptKey, optionsKey, correctKey, options, correctIdx };
  }, [current]);

  async function submit(choiceIdx: number) {
    if (!current) return;

    setAnsweredIdx(choiceIdx);
    const correct = meta.correctIdx >= 0 && choiceIdx === meta.correctIdx;
    setIsCorrect(correct);
    setCoins((c) => c + (correct ? 10 : -5));

    // Optional: persist answer
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const qid = meta.idKey ? current[meta.idKey] : null;
      const answerText = meta.options[choiceIdx] ?? String(choiceIdx);
      // answers table = { id uuid, question_id bigint, user_id uuid, answer text, created_at ts }
      // if your question_id is not BIGINT, you already dropped FK so plain insert is fine
      await supabase.from("answers").insert({
        question_id: qid ?? null,
        user_id: user.id,
        answer: answerText,
      });
    }
  }

  function next() {
    setAnsweredIdx(null);
    setIsCorrect(null);
    setI((x) => Math.min(x + 1, rows.length)); // go past end to show "done"
  }

  if (loading) return <main className="p-6">Loading…</main>;
  if (err) return <main className="p-6 text-red-500">Error: {err}</main>;
  if (!current) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-sm opacity-70">All done 👏 — total coins: {coins}</div>
        <button className="rounded bg-black/80 text-white px-3 py-1" onClick={() => { setI(0); setCoins(0); }}>
          Restart
        </button>
      </main>
    );
  }

  const prompt = meta.promptKey ? String(current[meta.promptKey]) : "(no prompt column found)";
  const opts = meta.options;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs opacity-70">
        <div>question {i+1}/{rows.length}</div>
        <div>coins: {coins}</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="text-base font-medium mb-3">{prompt}</div>

        {opts.length === 0 ? (
          <div className="text-sm opacity-70">No options column found (looked for: options/choices/answers/opts/variants).</div>
        ) : (
          <div className="grid gap-2">
            {opts.map((opt, idx) => {
              const picked = answeredIdx === idx;
              const showResult = answeredIdx !== null;
              const isRight = meta.correctIdx >= 0 && idx === meta.correctIdx;

              let cls = "rounded border px-3 py-2 text-left";
              if (showResult) {
                if (picked && isRight) cls += " bg-green-50 border-green-400";
                else if (picked && !isRight) cls += " bg-red-50 border-red-400";
                else if (isRight) cls += " bg-green-50/40 border-green-300";
              } else {
                cls += " hover:bg-black/5 cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  className={cls}
                  disabled={showResult}
                  onClick={() => submit(idx)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {answeredIdx !== null && (
          <div className={"mt-3 text-sm " + (isCorrect ? "text-green-600" : "text-red-600")}>
            {isCorrect ? "Correct! +10 coins" : "Oops! -5 coins"}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            className="rounded bg-black/80 text-white px-3 py-1"
            onClick={next}
            disabled={answeredIdx === null}
          >
            Next
          </button>
          <button
            className="rounded border px-3 py-1"
            onClick={() => { setAnsweredIdx(null); setIsCorrect(null); }}
            disabled={answeredIdx === null}
          >
            Change answer
          </button>
        </div>
      </div>

      <div className="text-[11px] opacity-60">
        using: public.questions_import2
        {meta.correctIdx >= 0 ? ` • correct index: ${meta.correctIdx}` : " • no explicit correct index found"}
      </div>
    </main>
  );
}
