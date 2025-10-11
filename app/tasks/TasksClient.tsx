'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supa';

type Task = { id: string; created_at: string; status?: string; [k: string]: any };

export default function TasksClient({ initialTasks = [] as Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // subscribe ONCE; clean up on unmount
  useEffect(() => {
    const channel = supabase
      .channel('tasks-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        setTasks(prev => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t);
          if (payload.eventType === 'DELETE') return prev.filter(t => t.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const submitAnswer = useCallback(async (taskId: string, answer: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'submitting' } : t));
    const { error } = await supabase.from('answers').insert({ task_id: taskId, answer });
    if (error) {
      console.error('submit error', error);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t));
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'answered' } : t));
      // realtime will bring the final row state; no full refetch
    }
  }, []);

  return (
    <main className="p-6">
      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="rounded border p-3">
            <div className="text-sm opacity-70">{new Date(t.created_at).toLocaleString()}</div>
            {/* replace with your real task UI; call submitAnswer(taskId, answer) on submit */}
          </li>
        ))}
      </ul>
    </main>
  );
}
