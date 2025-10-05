'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type Row = {
  user_id: string;
  username: string;
  batch?: string | null;
  level?: number | null;
  xp_total?: number | null;
  rank?: number | null;
};

const batches = ['8A','8B','8C'] as const;

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [tab, setTab] = useState<typeof batches[number]>('8A');

  const load = async (_batch: string) => {
    setLoading(true); setErr(undefined);
    try {
      const data = await api.leaderboard('batch', _batch, 20);
      setRows((data as any[]) ?? []);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  return (
    <AuthGate>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="h1">Leaderboard</h1>
          <div className="subtle">Top players in each batch.</div>
        </div>
        <div className="flex gap-2">
          {batches.map(b => (
            <button
              key={b}
              onClick={() => setTab(b)}
              className={`btn ${tab===b ? 'btn-primary' : 'btn-ghost'}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_,i)=>(
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 w-64 bg-ink-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {!loading && !err && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/60">
              <tr className="text-left">
                <Th className="w-14">#</Th>
                <Th>User</Th>
                <Th className="w-24">Batch</Th>
                <Th className="w-24">Level</Th>
                <Th className="w-24">XP</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.user_id} className="border-t border-ink-900/70">
                  <Td className="font-semibold">{medal(i)}</Td>
                  <Td>{r.username}</Td>
                  <Td>{r.batch ?? tab}</Td>
                  <Td>{r.level ?? '-'}</Td>
                  <Td>{r.xp_total ?? 0}</Td>
                </tr>
              ))}
              {!rows.length && (
                <tr><Td colSpan={5} className="text-center text-ink-400 py-6">No players yet.</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AuthGate>
  );
}

function Th({ children, className }: any) {
  return <th className={`px-4 py-3 text-ink-300 ${className ?? ''}`}>{children}</th>;
}
function Td({ children, className, colSpan }: any) {
  return <td colSpan={colSpan} className={`px-4 py-3 ${className ?? ''}`}>{children}</td>;
}
function medal(i: number) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return i + 1;
}
