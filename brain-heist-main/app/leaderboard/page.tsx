'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import HackFeed from '@/components/HackFeed';

type Row = {
  uid: string;
  username: string | null;
  rank: number | null;
  xp: number | null;
  creds: number | null;
  last_online_mins: number | null;
};

const BATCHES = ['8A','8B','8C'] as const;
type Batch = typeof BATCHES[number];

export default function LeaderboardPage() {
  const supa = supabase;
  const [batch, setBatch] = useState<Batch>('8A');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(b: Batch) {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.rpc('rpc_leaderboard_top', { p_batch: b, limit_n: 50 });
      if (error) throw new Error(error.message);
      setRows(Array.isArray(data) ? data as Row[] : []);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(batch); }, [batch]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          {BATCHES.map(b => (
            <button
              key={b}
              onClick={() => setBatch(b)}
              className={`px-3 py-2 rounded-xl text-sm ${batch===b ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-card)]/70'}`}
            >{b}</button>
          ))}
        </div>
      </div>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-4 bg-[var(--c-surface)]/80">
          {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
          {loading ? (
            <div className="opacity-70 text-sm">Loading leaderboard…</div>
          ) : rows.length === 0 ? (
            <div className="opacity-70 text-sm">No players yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2">#</th>
                  <th>Player</th>
                  <th>Rank</th>
                  <th>XP</th>
                  <th>Creds</th>
                  <th>Last Online</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.uid} className="border-t border-white/10">
                    <td className="py-2">{i+1}</td>
                    <td>{r.username ?? r.uid.slice(0,6)}</td>
                    <td>{r.rank ?? 0}</td>
                    <td>{r.xp ?? 0}</td>
                    <td>{r.creds ?? 0}</td>
                    <td>{r.last_online_mins != null ? `${r.last_online_mins}m ago` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="space-y-2">
          <h2 className="text-lg font-semibold">Live Feed</h2>
          <HackFeed limit={30} />
        </aside>
      </section>
    </main>
  );
}
