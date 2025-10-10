'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { useAudio } from '@/components/AudioProvider';

type Q = { id: number; prompt: string; options: string[]; xp?: number; creds?: number };

type Props = {
  open?: boolean;
  // Optional: pass a question directly
  question?: Q;
  // Optional: if you prefer the modal to fetch one itself
  userTaskId?: number; // kept for backward-compat, not required
  onClose?: () => void;
  onResult?: (r: { correct: boolean; xp: number; creds: number }) => void;
};

export default function QuestionModal({ open = true, question, userTaskId, onClose, onResult }: Props) {
  const supa = supabase;
  const sfx = useAudio();

  const [q, setQ] = useState<Q | null>(question ?? null);
  const [loading, setLoading] = useState(!question);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);

  // If no question provided, fetch one from the user's batch
  useEffect(() => {
    if (question || !open) return;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id ?? null;
        if (!uid) throw new Error('Not logged in');

        const { data: u } = await supabase.from('users').select('batch').eq('uid', uid).maybeSingle();
        const batch = (u as any)?.batch ?? '8A';

        const { data, error } = await supabase.rpc('rpc_questions_next', { p_batch: batch, limit_n: 1 });
        if (error) throw new Error(error.message);
        const picked = Array.isArray(data) && data.length > 0 ? (data as any)[0] as Q : null;
        if (!picked) throw new Error('No questions available');
        setQ(picked);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load question');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, question, supabase]);

  if (!open) return null;

  async function answer(i: number) {
    if (!q || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('rpc_task_submit_frontend', {
        p_question_id: q.id,
        p_answer: i + 1, // DB is 1-based
      });
      if (error) throw new Error(error.message);

      const ok = (data as any)?.ok === true;
      const correct = (data as any)?.correct === true;
      const xp = Number((data as any)?.xp ?? 0);
      const creds = Number((data as any)?.creds ?? 0);

      if (ok && correct) { setFlash('right'); await sfx.correct?.(); }
      else { setFlash('wrong'); await sfx.wrong?.(); }

      // brief flash then close
      setTimeout(() => {
        setFlash(null);
        onResult?.({ correct, xp, creds });
        onClose?.();
      }, 650);
    } catch (e: any) {
      setErr(e?.message ?? 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--c-card)]/80 border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Quick Task</h3>
          <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">Close</button>
        </div>

        {err && <div className="text-xs rounded-xl bg-rose-500/15 border border-rose-500/40 p-2 mb-2">{err}</div>}

        {loading || !q ? (
          <div className="opacity-70 text-sm">Loading…</div>
        ) : (
          <div className={`rounded-xl p-3 bg-black/25 border ${flash==='right'?'border-emerald-400':flash==='wrong'?'border-rose-400':'border-white/10'}`}>
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
            <div className="text-[11px] opacity-60 mt-3">
              Worth: ✨{q.xp ?? 0} · 💰{q.creds ?? 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
