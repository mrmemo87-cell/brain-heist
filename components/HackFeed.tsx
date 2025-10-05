'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/rpc';

export default function HackFeed({ limit = 20 }: { limit?: number }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async ()=> {
    try {
      const data = await api.rpc<any[]>('rpc_hack_feed', { _limit: limit });
      setRows(data ?? []);
    } catch (e) {
      console.error(e);
    }
  })(); }, [limit]);

  return (
    <div className="card p-3">
      <div className="font-semibold mb-2">Recent hacks (your batch)</div>
      <div className="space-y-2 text-sm">
        {rows.map(r => (
          <div key={r.id} className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{r.attacker_name}</span>
              <span className="text-ink-400"> → </span>
              <span className="font-semibold">{r.defender_name}</span>
              <span className="text-ink-400"> • </span>
              <span className="text-xs">{r.outcome.toUpperCase()}</span>
            </div>
            <div className="text-ink-400 text-xs">{new Date(r.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
        {!rows.length && <div className="text-ink-400">No activity yet.</div>}
      </div>
    </div>
  );
}
