"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Virtuoso } from "react-virtuoso";
import { supabase } from "@/lib/supa";
import TaskItem from "./TaskItem";

type Task = { id: string; created_at: string; status?: string; [k: string]: any };

const FALLBACK_TABLES = [
  // You can override via env: NEXT_PUBLIC_TASKS_TABLE="my_table" or comma-separated
  // These are common guesses if your table isn't literally "tasks"
  "tasks", "questions", "quests", "task_items", "quiz_questions", "hack_tasks"
];

async function trySelectOne(table: string) {
  try {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) return { ok: false as const, table, error };
    return { ok: true as const, table, data: data ?? [] };
  } catch (e) {
    return { ok: false as const, table, error: e };
  }
}

export default function TasksClient() {
  const [tableName, setTableName] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const mounted = useRef(true);

  // 1) init: ensure session, auto-detect table, fetch initial rows
  useEffect(() => {
    mounted.current = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If your app requires auth, you might redirect here
        // router.replace("/login");
        console.warn("No session; showing public data if RLS allows.");
      }

      // Allow override from env (comma-separated to try in order)
      const envOverride = (process.env.NEXT_PUBLIC_TASKS_TABLE ?? "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const candidates = envOverride.length > 0 ? envOverride : FALLBACK_TABLES;

      // probe candidates until one works
      for (const tbl of candidates) {
        const probe = await trySelectOne(tbl);
        if (probe.ok) {
          if (!mounted.current) return;
          setTableName(tbl);

          // initial fetch (larger)
          const { data, error } = await supabase
            .from(tbl)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

          if (!error && data && mounted.current) setTasks(data as Task[]);
          if (error) console.error(`[tasks] initial fetch error on ${tbl}`, error);
          return;
        }
      }

      console.error(
        "[tasks] Could not find a table. Set NEXT_PUBLIC_TASKS_TABLE to your table name (or add it to FALLBACK_TABLES)."
      );
    })();

    return () => { mounted.current = false; };
  }, []);

  // 2) realtime subscription to the detected table
  useEffect(() => {
    if (!tableName) return;
    const ch = supabase
      .channel(`tasks-updates:${tableName}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName },
        (payload: any) => {
          startTransition(() => {
            setTasks(prev => {
              if (payload.eventType === "INSERT") return [payload.new, ...prev];
              if (payload.eventType === "UPDATE") return prev.map(t => (t.id === payload.new.id ? { ...t, ...payload.new } : t));
              if (payload.eventType === "DELETE") return prev.filter(t => t.id !== payload.old.id);
              return prev;
            });
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [tableName]);

  // 3) answering: try insert into "answers" if it exists; otherwise keep UI optimistic
  const submitAnswer = useCallback(async (taskId: string, answer: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "submitting" } : t)));

    try {
      const { error } = await supabase.from("answers").insert({ task_id: taskId, answer });
      if (error && (error as any)?.code === "42P01") {
        console.warn("answers table not found; skipping insert (UI stays optimistic)");
      } else if (error) {
        console.error("submit error", error);
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "error" } : t)));
        return;
      }
    } catch (e) {
      console.error("submit error", e);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "error" } : t)));
      return;
    }

    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: "answered" } : t)));
    // Realtime will reconcile final state if the table exists and RLS allows
  }, []);

  const header = useMemo(() => (
    <div className="text-xs opacity-70 mb-2">
      Using table: <code>{tableName ?? "(detecting… set NEXT_PUBLIC_TASKS_TABLE to skip)"}</code> • items: {tasks.length}
    </div>
  ), [tableName, tasks.length]);

  return (
    <main className="p-6">
      {header}
      <Virtuoso
        style={{ height: "calc(100vh - 140px)" }}
        data={tasks}
        itemContent={(index, t) => <TaskItem task={t} onAnswer={submitAnswer} />}
      />
    </main>
  );
}