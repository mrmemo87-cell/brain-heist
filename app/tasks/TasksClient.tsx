"use client";

import { useCallback, useEffect, useRef, useState, startTransition, memo } from "react";
import { Virtuoso } from "react-virtuoso";
import { supabase } from "@/lib/supa";

type Task = {
  id: string;
  created_at: string;
  status?: string;
  [k: string]: any;
};

export default function TasksClient({ initialTasks = [] as Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const subReady = useRef(false);

  // subscribe ONCE; clean up on unmount
  useEffect(() => {
    if (subReady.current) return;
    subReady.current = true;

    const channel = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload: any) => {
          startTransition(() => {
            setTasks((prev) => {
              if (payload.eventType === "INSERT") return [payload.new, ...prev];
              if (payload.eventType === "UPDATE")
                return prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t));
              if (payload.eventType === "DELETE")
                return prev.filter((t) => t.id !== payload.old.id);
              return prev;
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subReady.current = false;
    };
  }, []);

  const submitAnswer = useCallback(async (taskId: string, answer: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "submitting" } : t)));

    const { error } = await supabase.from("answers").insert({ task_id: taskId, answer });
    if (error) {
      console.error("submit error", error);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "error" } : t)));
      return;
    }

    // realtime will sync the final row
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "answered" } : t)));
  }, []);

  return (
    <main className="p-6">
      <Virtuoso
        style={{ height: "calc(100vh - 140px)" }}
        data={tasks}
        itemContent={(index, t) => <TaskRow task={t} onAnswer={submitAnswer} />}
      />
    </main>
  );
}

const TaskRow = memo(function TaskRow({
  task,
  onAnswer,
}: {
  task: Task;
  onAnswer: (id: string, answer: string) => void;
}) {
  return (
    <div className="rounded border p-3">
      <div className="text-sm opacity-70 mb-2">
        {new Date(task.created_at).toLocaleString()}
      </div>

      {/* replace with your real task UI */}
      <div className="flex items-center gap-2">
        <button
          className="rounded bg-black/80 px-3 py-1 text-white"
          onClick={() => onAnswer(task.id, "42")}
        >
          Answer “42”
        </button>
        {task.status && (
          <span className="text-xs opacity-70">status: {task.status}</span>
        )}
      </div>
    </div>
  );
});
