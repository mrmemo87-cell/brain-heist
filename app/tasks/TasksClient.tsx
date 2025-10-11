"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { Virtuoso } from "react-virtuoso";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supa";

type Task = { id: string; status?: string; created_at?: string; [k: string]: any };

export default function TasksClient() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const mounted = useRef(true);
  const subReady = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      // initial fetch from public.questions (ordered by id)
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("id", { ascending: false })
        .limit(50);

      if (error) {
        console.error("questions fetch error:", error.message ?? JSON.stringify(error));
      } else if (mounted.current && data) {
        setTasks(data as Task[]);
      }
    };
    init();

    if (!subReady.current) {
      subReady.current = true;
      const ch = supabase
        .channel("questions-updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, (payload: any) => {
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
  }, [router]);

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    setTasks(prev => prev.map(t => (t.id === questionId ? { ...t, status: "submitting" } : t)));
    const { error } = await supabase.from("answers").insert({ question_id: questionId, answer });
    if (error) {
      console.error("submit error:", error.message ?? JSON.stringify(error));
      setTasks(prev => prev.map(t => (t.id === questionId ? { ...t, status: "error" } : t)));
      return;
    }
    setTasks(prev => prev.map(t => (t.id === questionId ? { ...t, status: "answered" } : t)));
  }, []);

  return (
    <main className="p-6">
      <div className="mb-2 text-xs opacity-70">Using questions order: id • items: {tasks.length}</div>
      <Virtuoso
        style={{ height: "calc(100vh - 140px)" }}
        data={tasks}
        itemContent={(index, t) => (
          <div className="rounded border p-3">
            <div className="text-sm opacity-70 mb-2">
              {(t.created_at ? new Date(t.created_at) : new Date()).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded bg-black/80 px-3 py-1 text-white" onClick={() => submitAnswer(t.id, "42")}>
                Answer “42”
              </button>
              {t.status && <span className="text-xs opacity-70">status: {t.status}</span>}
            </div>
          </div>
        )}
      />
    </main>
  );
}