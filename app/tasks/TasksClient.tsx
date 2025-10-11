"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";

type Question = { id: number; prompt: string; options: string[] | null };

export default function TasksClient() {
  const [rows, setRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("questions_import2")
        .select("id,prompt,options")
        .order("id", { ascending: false })
        .limit(50);

      if (error) setErr(error.message);
      else setRows((data ?? []) as Question[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main className="p-6">Loading…</main>;
  if (err) return <main className="p-6 text-red-500">Error: {err}</main>;

  return (
    <main className="p-6 space-y-3">
      <div className="text-xs opacity-70">Source: public.questions_import2 • items: {rows.length}</div>
      {rows.map(q => (
        <div key={q.id} className="rounded border p-3">
          <div className="text-sm opacity-70 mb-1">id: {q.id}</div>
          <div className="font-medium">{q.prompt}</div>
        </div>
      ))}
    </main>
  );
}
