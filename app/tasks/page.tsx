'use client';
// add imports:
import { Card, CardRow } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AuthGate } from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/rpc';

type TaskRow = {
  id: number; kind: 'daily'|'weekly'; code: string; title: string; description: string;
  target_int: number; progress: number; completed: boolean; claimed: boolean; period_key: string;
};

export default function Tasks() {
  const [tasks,setTasks]=useState<TaskRow[]>([]);
  const [loading,setLoading]=useState(true);
 const refresh = async () => {
  setLoading(true);
  try {
    // 1) ensure there is a profile row
    const { data: auth } = await supabase.auth.getUser();
    const email = auth.user?.email ?? 'player';
    const usernameFallback = email.split('@')[0];

    const me = await api.profileMe() as any[];
    if (!me || me.length === 0) {
      // pick a default batch if you haven't assigned yet; adjust as needed
      await supabase.rpc('rpc_register', {
        _batch: '8A',                 // <- change if you want a different default
        _username: usernameFallback,  // or prompt later
        _avatar_url: null
      });
    }

    // 2) normal bootstrap + list
    await api.touchLogin();
    await api.tasksBootstrap();
    const list = await api.tasksList();
    setTasks(list as TaskRow[]);
  } catch (e:any) {
    console.error(e);
  }
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
      // inside your return, replace the map:
{tasks.map(t => (
  <Card key={t.id} className="space-y-2">
    <CardRow>
      <div>
        <div className="subtle uppercase">{t.kind}</div>
        <div className="font-semibold">{t.title}</div>
        <div className="text-sm text-ink-300">{t.description}</div>
      </div>
      <div className="text-sm">
        <Badge>{t.progress}/{t.target_int}</Badge>
      </div>
    </CardRow>
    <div className="flex gap-2">
      {!t.completed && <Button variant="ghost" onClick={()=>submit(t.id)}>+1</Button>}
      {t.completed && !t.claimed && <Button onClick={()=>claim(t.id)}>Claim</Button>}
      {t.claimed && <span className="text-primary">Claimed</span>}
    </div>
  </Card>
))}
    </AuthGate>
  );
}
