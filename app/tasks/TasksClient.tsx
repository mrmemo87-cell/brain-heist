'use client';

import { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import { supabase } from '@/lib/supa';
import TaskItem from './TaskItem';

type Task = { id: string; created_at: string; status?: string; [k: string]: any };

export default function TasksClient({ initialTasks = [] as Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const mounted = useRef(false);

  // subscribe ONCE; clean up on unmount; filter to the table you need
  useEffect(() => {
    mounted.current = true;

    const channel = supabase
      .channel('tasks-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' }, // add `filter: 'user_id=eq.<uuid>'` if applicable
        (payload: any) => {
          startTransition(() => {
            setTasks(prev => {
              if (payload.eventType === 'INSERT') return [payload.new, ...prev];
              if (payload.eventType === 'UPDATE') return prev.map(t => (t.id === payload.new.id ? { ...t, ...payload.new } : t));
              if (payload.eventType === 'DELETE') return prev.filter(t => t.id !== payload.old.id);
              return prev;
            });
          });
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // answer handler (no full refetch, optimistic update)
  const submitAnswer = useCallback(async (taskId: string, answer: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'submitting' } : t)));

    const { error } = await supabase.from('answers').insert({ task_id: taskId, answer });
    if (error) {
      console.error('submit error', error);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'error' } : t)));
      return;
    }

    // Let realtime bring final state; just mark as answered
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'answered' } : t)));
  }, []);

  return (
    <main className="p-6">
      <ul className="space-y-2">
        {tasks.map(t => (
          <TaskItem key={t.id} task={t} onAnswer={submitAnswer} />
        ))}
      </ul>
    </main>
  );
}
