'use client';

import React, { useEffect, useState } from "react";
import { rpcHackFeed } from "@/lib/api";

export default function Feed({ limit = 20 }: { limit?: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await rpcHackFeed(limit);
        if (mounted) setRows(data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [limit]);

  return (
    <div className="space-y-2">
      {loading && <div className="text-sm text-gray-400">Loading feed…</div>}
      {!loading && rows.length === 0 && <div className="text-sm text-gray-500">No activity yet</div>}
      {rows.map((r:any) => (
        <div key={r.id} className="flex items-center gap-3 p-2 rounded-md bg-[rgba(255,255,255,0.02)]">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs">{(r.attacker_name ?? "A").slice(0,2)}</div>
          <div className="flex-1 text-sm text-gray-200">
            <div className="text-xs text-gray-400">{new Date(r.ts).toLocaleString()}</div>
            <div>
              <span className="font-semibold text-white">{r.attacker_name ?? r.attacker_id}</span>
              <span className="text-gray-300"> → </span>
              <span className="font-semibold text-white">{r.defender_name ?? r.defender_id}</span>
              <span className="ml-2 text-xs text-gray-300"> {r.outcome}</span>
            </div>
          </div>
          <div className="text-sm text-gray-300">{r.coins_awarded ?? 0} ⚡</div>
        </div>
      ))}
    </div>
  );
}
