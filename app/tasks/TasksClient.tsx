"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { Virtuoso } from "react-virtuoso";
import { supabase } from "@/lib/supa";
import TaskItem from "./TaskItem";

type Task = {
  id: string;
  created_at: string;
  status?: string;
  [k: string]: any;
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const mounted = useRef(true);
  const subReady = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      // (optional) require auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // initial fetch
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data && mounted.current) setTasks(data as Task[]);
    };
    init();

    if (!subReady.current) {
      subReady.current = true;
      const ch = supabase
        .channel("tasks-updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload: any) => {
          startTransition(() => {
            setTasks(prev => {
              if (payload.eventType === "INSERT") return [payload.new, ...prev];
              if (payload.eventType === "UPDATE") return prev.map(t => (t.id === payload.new.id ? { ...t, ...payload.new } : t));
              if (payload.eventType === "DELETE") return prev.filter(t => t.id !== payload.old.id);
              return prev;
            });
          });
        })
        .subscribe();

      return () => {
        mounted.current = false;
        supabase.removeChannel(ch);
        subReady.current = false;
      };
    }

    return () => { mounted.current = false; };
  }, []);

  const submitAnswer = useCallback(async (taskId: string, answer: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "submitting" } : t)));

    const { error } = await supabase.from("answers").insert({ task_id: taskId, answer });
    if (error) {
      console.error("submit error", error);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "error" } : t)));
      return;
    }

    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "answered" } : t)));
  }, []);

  return (
    <main className="p-6">
      <Virtuoso
        style={{ height: "calc(100vh - 140px)" }}
        data={tasks}
        itemContent={(index, t) => <TaskItem task={t} onAnswer={submitAnswer} />}
      />
    </main>
  );
}