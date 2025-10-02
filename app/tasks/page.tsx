'use client';
import { AuthGate } from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type TaskRow = {
  id: number; kind: 'daily'|'weekly'; code: string; title: string; description: string;
  target_int: number; progress: number; completed: boolean; claimed: boolean; period_key: string;
};

export default function Tasks() {
  const [tasks,setTasks]=useState<TaskRow[]>([]);
  const [loading,setLoading]=useState(true);
  const refresh = async () => {
    setLoading(true);
    await api.touchLogin();
    await api.tasksBootstrap();
    const list = await api.tasksList();
    setTasks(list as TaskRow[]);
    setLoading(false);
  };
  useEffect(()=>{ refresh(); },[]);

  const submit = async (id:number) => { await api.taskSubmit(id,1); await refresh(); };
  const claim = async (id:number) => { await api.taskClaim(id); await refresh(); };

  return (
    <AuthGate>
      <h1 className="text-xl font-semibold mb-4">Tasks</h1>
      {loading ? <div>Loading…</div> :
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="rounded bg-slate-900 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase text-slate-400">{t.kind}</div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-slate-400">{t.description}</div>
                </div>
                <div className="text-sm">{t.progress}/{t.target_int}</div>
              </div>
              <div className="mt-2 flex gap-2">
                {!t.completed && <button onClick={()=>submit(t.id)} className="px-3 py-1 bg-slate-800 rounded">+1</button>}
                {t.completed && !t.claimed && <button onClick={()=>claim(t.id)} className="px-3 py-1 bg-emerald-600 rounded">Claim</button>}
                {t.claimed && <span className="text-emerald-400 text-sm">Claimed</span>}
              </div>
            </div>
          ))}
        </div>
      }
    </AuthGate>
  );
}
