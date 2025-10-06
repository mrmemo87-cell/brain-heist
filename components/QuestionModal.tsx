'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/rpc';
import { useToast } from '@/components/ui/toast';
import { SFX } from '@/lib/sfx';

export default function QuestionModal({
  userTaskId,
  onClose,
  onAnswered,
}: {
  userTaskId: number;
  onClose: () => void;
  onAnswered: (ok: boolean) => void;
}) {
  const [q, setQ] = useState<{ id: number; prompt: string; choices: string[] } | null>(null);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const load = async () => {
    setErr(undefined);
    try {
      const res = await api.rpc<any[]>('rpc_task_question', { _user_task_id: userTaskId });
      setQ(res?.[0] ?? null);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTaskId]);

  const answer = async (i: number) => {
    if (!q) return;
    setBusy(true);
    try {
      const res = await api.rpc<any[]>('rpc_task_answer', {
        _user_task_id: userTaskId,
        _question_id: q.id,
        _choice_index: i,
      });
      const row = res?.[0] ?? {};
      const ok = !!row?.correct;

      // SFX & toasts
      if (ok) { SFX.correct(); toast('✅ Correct!'); }
      else { SFX.wrong(); toast(row?.penalty ? `❌ ${row.penalty}` : '❌ Try again'); }

      onAnswered(ok);
      onClose();

      // Broadcast so TopBar/Profile refresh coins/XP quickly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bh:profile:refresh'));
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card p-4 max-w-xl w-[92%]">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Answer to progress</div>
          <button onClick={onClose} className="text-ink-300 hover:text-white">
            ✕
          </button>
        </div>

        {!q && !err && <div>Loading question…</div>}
        {err && <div className="text-red-400 text-sm">{err}</div>}

        {q && (
          <>
            <div className="mb-3">{q.prompt}</div>
            <div className="grid gap-2">
              {q.choices.map((c, idx) => (
                <button
                  key={idx}
                  disabled={busy}
                  onClick={() => answer(idx)}
                  className="btn btn-ghost text-left"
                >
                  {String.fromCharCode(65 + idx)}. {c}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
