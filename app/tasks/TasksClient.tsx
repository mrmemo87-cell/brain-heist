"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";

type Row = Record<string, any>;

export default function TasksClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string|null>(null);
  const [keyField, setKeyField] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("questions_import2")
        .select("*")     // ← no hardcoded columns
        .limit(50);      // ← no order

      if (error) { setErr(error.message); return; }

      const list = (data ?? []) as Row[];
      // pick a key column: prefer *id-ish*, else first column
      const first = list[0] || {};
      const cols = Object.keys(first);
      const idLike = cols.find(c => /(^id$|_id$)/i.test(c)) || cols[0] || "";
      setKeyField(idLike);
      setRows(list);
      console.log("questions_import2 columns:", cols);
    })();
  }, []);

  if (err) return <main className="p-6 text-red-500">Error: {err}</main>;

  return (
    <main className="p-6 space-y-3">
      <div className="text-xs opacity-70">Source: public.questions_import2 • items: {rows.length} • key: {keyField || "index"}</div>
      {rows.map((r, i) => {
        const key = keyField ? String(r[keyField]) : String(i);
        const prompt = r.prompt ?? JSON.stringify(r);
        return (
          <div key={key} className="rounded border p-3">
            <div className="font-medium">{prompt}</div>
          </div>
        );
      })}
    </main>
  );
}
