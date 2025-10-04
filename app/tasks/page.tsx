'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';
import Progress from '@/components/ui/Progress';
import { useToast } from '@/components/ui/toast';

type TaskRow = {
  id: number; kind: 'daily'|'weekly'; code: string; title: string; description: string;
  target_int: number; progress: number; completed: boolean; claimed: boolean; period_key: string;
};

export default function Tasks() {
  const [tasks,setTasks]=useState<TaskRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|undefined>();
  const toast = useToast();

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

  const submit = async (id:number) => {
    try { await api.taskSubmit(id,1); await refresh(); toast('Progress +1 ✅'); }
    catch(e:any){ setErr(e.message); toast('Error'); }
  };
  const claim = async (id:number) => {
    try { await api.taskClaim(id); await refresh(); toast('Reward claimed 🎁'); }
    catch(e:any){ setErr(e.message); toast('Error'); }
  };

  return (
    <AuthGate>
      <div className="mb-5">
        <h1 className="h1">Tasks</h1>
        <div className="subtle">Complete dailies & weeklies to earn XP and coins.</div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_,i)=>(
            <div key={i} className="card card-hover p-4 animate-pulse">
              <div className="h-4 w-40 bg-ink-800 rounded mb-2" />
              <div className="h-3 w-64 bg-ink-800 rounded mb-4" />
              <div className="progress"><span style={{width:'30%'}} /></div>
            </div>
          ))}
        </div>
      )}

      {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

      {!loading && !err && (
        <div className="space-y-3">
          {tasks.map(t => {
            const pct = Math.round((t.progress / Math.max(1,t.target_int))*100);
            return (
              <div key={t.id} className="card card-hover p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase text-ink-300">{t.kind}</div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-ink-300">{t.description}</div>
                  </div>
                  <div className="text-sm text-ink-200">{t.progress}/{t.target_int}</div>
                </div>

                <div className="mt-3">
                  <Progress value={t.progress} max={t.target_int} />
                  <div className="text-xs text-ink-300 mt-1">{pct}%</div>
                </div>

                <div className="mt-3 flex gap-2">
                  {!t.completed && (
                    <button onClick={()=>submit(t.id)} className="btn btn-ghost">+1</button>
                  )}
                  {t.completed && !t.claimed && (
                    <button onClick={()=>claim(t.id)} className="btn btn-primary">Claim</button>
                  )}
                  {t.claimed && <span className="text-emerald-400 text-sm">Claimed</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AuthGate>
  );
}
