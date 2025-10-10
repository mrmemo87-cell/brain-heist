'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { useAudio } from '../../components/AudioProvider';

type Q = { id: number; prompt: string; options: string[]; answer: number; xp: number; creds: number };

export default function TasksPage() {
  const supa = supabase;
  const audio = useAudio();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<string | null>(null);
  const [queue, setQueue] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<'right'|'wrong'|null>(null);

  async function loadQuestions(myBatch: string) {
    const { data, error } = await supabase.rpc('rpc_questions_next', { p_batch: myBatch, limit_n: 50 });
    if (error) throw new Error(error.message);
    const list = Array.isArray(data) ? (data as any as Q[]) : [];
    // light shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setQueue(list);
    setIdx(0);
  }

  async function boot() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { window.location.href = '/login'; return; }

      // ensure user rows exist (no-throw)
      try { await supabase.rpc('rpc_session_start'); } catch {}

      // read my batch
      const { data: u } = await supabase.from('users').select('batch').eq('uid', uid).maybeSingle();
      const b = (u as any)?.batch ?? '8A';
      setBatch(b);

      await loadQuestions(b);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void boot(); }, []);

  async function answer(choiceIndex: number) {
    if (busy) return;
    const q = queue[idx];
    if (!q) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('rpc_task_submit_frontend', {
        p_question_id: q.id,
        p_answer: choiceIndex + 1, // answers are 1-based in DB
      });
      if (error) throw new Error(error.message);

      const ok = (data as any)?.ok === true;
      const correct = (data as any)?.correct === true;
      if (ok && correct) { setFlash('right'); audio.correct?.(); }
      else { setFlash('wrong'); audio.wrong?.(); }

      // move next after a short flash
      setTimeout(async () => {
        setFlash(null);
        const next = idx + 1;
        if (next < queue.length) {
          setIdx(next);
        } else {
          if (batch) await loadQuestions(batch);
        }
      }, 700);
    } catch (e:any) {
      setErr(e?.message ?? 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  const q = queue[idx];

  return (
    <main className="space-y-4">
      <h1>Tasks</h1>
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      {loading ? (
        <div className="opacity-70 text-sm">Loading…</div>
      ) : !q ? (
        <div className="opacity-70 text-sm">No questions available.</div>
      ) : (
        <div className={`rounded-2xl p-4 bg-[var(--c-card)]/70 border ${flash==='right'?'border-emerald-400':flash==='wrong'?'border-rose-400':'border-white/10'}`}>
          <div className="text-sm font-medium mb-3">{q.prompt}</div>
          <div className="grid gap-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={busy}
                onClick={() => void answer(i)}
                className="px-3 py-2 rounded-xl text-left bg-black/20 hover:bg-black/30 disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="text-[11px] opacity-60 mt-3">Worth: ✨{q.xp ?? 0} · 💰{q.creds ?? 0}</div>
        </div>
      )}
    </main>
  );
}
