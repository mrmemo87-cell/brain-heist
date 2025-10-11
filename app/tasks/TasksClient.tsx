"use client";
import { useEffect, useMemo, useState, startTransition } from "react";
import { supabase } from "@/lib/supa";

type Q = { prompt?: string; options_raw?: any; answer?: number | string; xp?: number|string; creds?: number|string; active?: any; created_at?: string; [k:string]: any };

const isActive = (v:any)=> v===true || String(v).toLowerCase()==="true" || Number(v)===1;
const toNum = (v:any)=> { const n=Number(v); return Number.isFinite(n)? n:0; };

function parseOptions(raw:any): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw==="string"){
    let s=raw.trim();
    if (s.startsWith("{")&&s.endsWith("}")) { s=s.slice(1,-1); return s.split(",").map(x=>x.trim().replace(/^["']|["']$/g,"")).filter(Boolean); }
    if (s.startsWith("[")||s.startsWith("{")) { try{ const j=JSON.parse(s); if(Array.isArray(j)) return j.map(String); if (j?.options) return j.options.map(String);}catch{} }
    if (s.includes("|")) return s.split("|").map(x=>x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(x=>x.trim()).filter(Boolean);
    return s? [s]:[];
  }
  return [];
}

export default function TasksClient(){
  const [rows,setRows]=useState<Q[]>([]);
  const [i,setI]=useState(0);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);
  const [coins,setCoins]=useState(0);  // local display only
  const [xp,setXp]=useState(0);
  const [creds,setCreds]=useState(0);
  const [picked,setPicked]=useState<number|null>(null);
  const [correct,setCorrect]=useState<boolean|null>(null);

  useEffect(()=>{(async()=>{
    const {data,error}=await supabase
      .from("questions_import2")
      .select("prompt,options_raw,answer,xp,creds,active,created_at")
      .order("created_at",{ascending:false})
      .limit(200);
    if(error){ setErr(error.message); setLoading(false); return; }
    setRows((data??[]).filter(r=>isActive((r as Q).active)) as Q[]);
    setLoading(false);
  })()},[]);

  const q = rows[i] ?? null;
  const opts = useMemo(()=>parseOptions(q?.options_raw),[q]);
  const correctIdx = useMemo(()=>{
    const n = toNum(q?.answer); if(!n) return -1;
    const z = Math.max(0, Math.floor(n)-1); return z<opts.length? z: -1;
  },[q,opts]);

  async function submit(choice:number){
    if (picked!==null || !q) return;

    startTransition(()=>{
      setPicked(choice);
      const ok = choice===correctIdx;
      setCorrect(ok);
      const gainXp = toNum(q.xp), gainCreds = toNum(q.creds);
      if (ok) { setXp(x=>x+gainXp); setCreds(c=>c+gainCreds); setCoins(c=>c+gainCreds); }
      else { setCoins(c=>c - Math.max(1, Math.ceil(gainCreds/2))); }
    });

    // background persist (no await → no UI stall)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const answerText = opts[choice] ?? String(choice);
      void supabase.from("answers").insert({
        question_id: null,            // FK removed earlier; fill if you add a numeric key
        user_id: user?.id ?? null,
        answer: answerText,
      });
    } catch {}
  }

  function next(){
    startTransition(()=>{ setPicked(null); setCorrect(null); setI(x=>Math.min(x+1, rows.length)); });
  }

  if(loading) return <main className="min-h-[60vh] grid place-items-center text-sm opacity-70">Loading…</main>;
  if(err) return <main className="p-6 text-red-500">Error: {err}</main>;
  if(!q) return (
    <main className="p-8 grid place-items-center">
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">All done 🎉</div>
        <div className="opacity-70 mb-4">coins {coins} • xp {xp} • creds {creds}</div>
        <button className="rounded-xl bg-black text-white px-4 py-2" onClick={()=>{ setI(0); setCoins(0); setXp(0); setCreds(0); }}>Restart</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-[100vh]">
      <div className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-black/30 border-b border-black/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between text-xs">
          <div className="opacity-70">question {i+1}/{rows.length}</div>
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-black/80 text-white">coins {coins}</div>
            <div className="px-2 py-1 rounded bg-emerald-600 text-white">xp {xp}</div>
            <div className="px-2 py-1 rounded bg-indigo-600 text-white">creds {creds}</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border shadow-xl bg-white dark:bg-zinc-900/70 p-6">
          <div className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            {q.prompt ?? "(no prompt)"}
          </div>

          <div className="grid gap-2">
            {opts.map((opt, idx)=>{
              const show = picked!==null; const isPick = picked===idx; const isRight = correctIdx===idx;
              let base = "text-left rounded-xl border px-4 py-3 transition shadow-sm select-none";
              // enforce readable text on all themes
              base += " text-neutral-900 dark:text-neutral-100";
              if (!show) base += " bg-white hover:bg-black/[0.04] dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer";
              else if (isPick && isRight) base += " bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30";
              else if (isPick && !isRight) base += " bg-rose-50 border-rose-400 dark:bg-rose-900/30";
              else if (isRight) base += " bg-emerald-50/60 border-emerald-300 dark:bg-emerald-900/20";
              else base += " bg-white dark:bg-white/10";
              return (
                <button key={idx} className={base} disabled={show} onClick={()=>submit(idx)}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs text-neutral-700 dark:text-neutral-200">
                      {String.fromCharCode(65+idx)}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {picked!==null && (
            <div className={"mt-4 text-sm " + (correct ? "text-emerald-600" : "text-rose-600")}>
              {correct
                ? `Correct! +${toNum(q.xp)} xp, +${toNum(q.creds)} creds`
                : `Oops! -${Math.max(1, Math.ceil(toNum(q.creds)/2))} coins`}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="rounded-xl border px-3 py-1.5" onClick={()=>{ setPicked(null); setCorrect(null); }} disabled={picked===null}>
              Change
            </button>
            <button className="rounded-xl bg-black text-white px-3 py-1.5" onClick={next} disabled={picked===null}>
              Next
            </button>
          </div>
        </div>

        <div className="mt-4 text-[11px] opacity-60">source: public.questions_import2 • batch ignored</div>
      </div>
    </main>
  );
}
