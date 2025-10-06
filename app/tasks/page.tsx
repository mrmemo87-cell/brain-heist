'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import QuestionModal from '@/components/QuestionModal';
import ProgressBar from '@/components/ProgressBar';

type Task = {
  id: number; kind: string; code: string; title: string;
  progress: number; target_int: number; completed: boolean; claimed: boolean; period_key: string;
};

export default function TasksPage() {
  const [rows,setRows] = useState<Task[]>([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState<string>();
  const [quizTask,setQuizTask] = useState<number|null>(null);
  const [playAnytimeBusy, setPlayAnytimeBusy] = useState(false);

  async function load(){
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      const list = await api.tasksList();
      setRows((list as any[]) ?? []);
    } catch(e:any){ setErr(e.message ?? 'Failed to load tasks'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function playAnytime() {
    if (playAnytimeBusy) return;
    setPlayAnytimeBusy(true);
    try {
      // Ensure tasks exist, then pick a quiz; fallback to first task
      await api.tasksBootstrap?.();
      let list = (await api.tasksList()) as any[] | null;
      if (!list || !list.length) list = (await api.tasksList()) as any[] | null;

      const firstQuiz = (list ?? []).find(x => x.kind === 'quiz' || x.code?.toLowerCase?.().includes('quiz'));
      const chosen = firstQuiz ?? (list ?? [])[0];
      if (chosen?.id) setQuizTask(chosen.id);
    } catch (e) {
      // ignore; UI already shows tasks if present
    } finally {
      setPlayAnytimeBusy(false);
    }
  }

  return (
    <AuthGate>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="h1">Tasks</h1>
          <div className="subtle">Daily challenges and quizzes. Earn XP + coins.</div>
        </div>
        <button className="btn btn-primary" onClick={playAnytime} disabled={playAnytimeBusy}>
          {playAnytimeBusy ? 'Loading…' : '▶️ Play Anytime'}
        </button>
      </div>

      {loading && <div className="card p-4 animate-pulse">Loading…</div>}
      {err && <div className="text-red-400 text-sm">{err}</div>}

      {!loading && !err && (
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map(t=>(
            <div key={t.id} className="card p-4 space-y-2">
              <div className="text-xs uppercase text-ink-400">{t.code}</div>
              <div className="font-semibold">{t.title}</div>
              <ProgressBar value={t.progress} max={Math.max(1, t.target_int)} />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={()=>setQuizTask(t.id)}
                  disabled={t.completed}
                >
                  {t.completed ? 'Completed' : 'Answer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {quizTask!==null && (
        <QuestionModal
          userTaskId={quizTask}
          onClose={()=>setQuizTask(null)}
          onAnswered={async(ok)=>{
            setQuizTask(null);
            await load();
            // Random loot surprise
            try {
              if (ok && Math.random() < 0.25) await api.openLoot(1);
            } catch {/* ignore */}
            // Ping TopBar/Profile to refresh coins/XP immediately
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('bh:profile:refresh'));
            }
          }}
        />
      )}
    </AuthGate>
  );
}
