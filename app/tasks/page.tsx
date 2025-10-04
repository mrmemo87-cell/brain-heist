'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type TaskRow = {
  id: number; kind: 'daily'|'weekly'; code: string; title: string; description: string;
  target_int: number; progress: number; completed: boolean; claimed: boolean; period_key: string;
};

export default function Tasks() {
  const [tasks,setTasks]=useState<TaskRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|undefined>();

  const refresh = async () => {
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      await api.tasksBootstrap();
      const list = await api.tasksList();
      setTasks(list as TaskRow[]);
    } catch (e:any) {
      setErr(e?.message ?? 'Something went wrong loading tasks.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ refresh(); },[]);

  const submit = async (id:number) => { try{ await api.taskSubmit(id,1); await refresh(); } catch(e:any){ setErr(e.message);} };
  const claim  = async (id:number) => { try{ await api.taskClaim(id);     await refresh(); } catch(e:any){ setErr(e.message);} };

  return (
    <AuthGate>
      <h1 className="h1 mb-4">Tasks</h1>
      {loading && <div>Loading…</div>}
      {err && <div className="text-red-400 text-sm mb-3">{err}</div>}
      {!loading && !err && (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="rounded bg-ink-900 p-3 border border-ink-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="subtle uppercase">{t.kind}</div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-ink-300">{t.description}</div>
                </div>
                <div className="text-sm">{t.progress}/{t.target_int}</div>
              </div>
              <div className="mt-2 flex gap-2">
                {!t.completed && <button onClick={()=>submit(t.id)} className="px-3 py-1 bg-ink-800 rounded">+1</button>}
                {t.completed && !t.claimed && <button onClick={()=>claim(t.id)} className="px-3 py-1 bg-emerald-600 rounded">Claim</button>}
                {t.claimed && <span className="text-emerald-400 text-sm">Claimed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AuthGate>
  );
}
