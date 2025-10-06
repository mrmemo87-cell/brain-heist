'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useMemo, useState } from 'react';
import HackFeed from '@/components/HackFeed';
import PlayerModal from '@/components/PlayerModal';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  user_id: string; username: string;
  batch?: string | null; level?: number | null; xp_total?: number | null; rank?: number | null;
};

const batches = ['8A','8B','8C'] as const;

type ModalUser = {
  user_id: string; username: string;
  avatar_url?: string|null; xp_total?: number|null; rank?: number|null;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [tab, setTab] = useState<typeof batches[number]>('8A');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<ModalUser|undefined>(undefined);

  const usernames = useMemo(()=> rows.map(r=>r.username).filter(Boolean) as string[], [rows]);

  const load = async (_batch: string) => {
    setLoading(true); setErr(undefined);
    try {
      const data = await api.leaderboard('batch', _batch, 50);
      setRows((data as any[]) ?? []);
    } catch (e: any) { setErr(e.message ?? 'Failed to load leaderboard.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  async function openPlayer(u: Row) {
    // Fetch avatar/xp from profiles (RLS must allow select on public.profiles)
    let avatar_url: string | null | undefined = null;
    let xp_total: number | null | undefined = u.xp_total ?? null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url,xp_total')
        .eq('user_id', u.user_id)
        .limit(1)
        .maybeSingle();
      avatar_url = data?.avatar_url ?? null;
      xp_total = data?.xp_total ?? xp_total ?? null;
    } catch { /* ignore */ }

    // Rank within current table
    const idx = rows.findIndex(r => r.user_id === u.user_id);
    const rank = idx >= 0 ? idx + 1 : null;

    setModalUser({ user_id: u.user_id, username: u.username, avatar_url, xp_total, rank });
    setModalOpen(true);
  }

  return (
    <AuthGate>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="h1">Leaderboard</h1>
          <div className="subtle">Top players in each batch.</div>
        </div>
        <div className="flex gap-2">
          {batches.map(b => (
            <button key={b} onClick={() => setTab(b)}
              className={`btn ${tab===b ? 'btn-primary' : 'btn-ghost'}`}>{b}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_,i)=>(<div key={i} className="card p-4 animate-pulse"><div className="h-4 w-64 bg-ink-800 rounded"/></div>))}
            </div>
          )}
          {err && <div className="text-red-400 text-sm">{err}</div>}
          {!loading && !err && (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-cyan-900/30 via-fuchsia-900/20 to-violet-900/30">
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
                    <tr
                      key={r.user_id}
                      className={[
                        'border-t border-ink-900/70 transition',
                        i===0 ? 'bg-amber-500/10' : i===1 ? 'bg-slate-300/10' : i===2 ? 'bg-amber-800/10' : 'hover:bg-white/[0.03]'
                      ].join(' ')}
                    >
                      <Td className="font-semibold">{medal(i)}</Td>
                      <Td>
                        <button
                          onClick={()=>openPlayer(r)}
                          className="underline decoration-dotted decoration-fuchsia-400/70 hover:decoration-2 hover:text-white transition"
                          title="View player"
                        >
                          {r.username}
                        </button>
                      </Td>
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
        </div>

        {/* Hack & News feed (filtered to usernames in this batch) */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Hack & News</div>
            <div className="text-2xl">📰⚡</div>
          </div>
          <HackFeed limit={20} usernames={usernames} />
          <div className="mt-3 text-xs text-ink-400">React with emojis after epic wins! 🔥 😎 🥶 🐍</div>
        </div>
      </div>

      <PlayerModal open={modalOpen} onClose={()=>setModalOpen(false)} data={modalUser} />
    </AuthGate>
  );
}

function Th({ children, className }: any) { return <th className={`px-4 py-3 text-ink-300 ${className ?? ''}`}>{children}</th>; }
function Td({ children, className, colSpan }: any) { return <td colSpan={colSpan} className={`px-4 py-3 ${className ?? ''}`}>{children}</td>; }
function medal(i: number) { if (i===0) return '🥇'; if (i===1) return '🥈'; if (i===2) return '🥉'; return i+1; }
