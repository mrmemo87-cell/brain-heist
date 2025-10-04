'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';

type Me = {
  user_id: string;
  username: string;
  batch: string;
  level: number;
  xp_total: number;
  coins_balance: number;
  streak_days: number;
  flair_item_id: number | null;
  flair_key: string | null;
  flair_name: string | null;
  flair_image_url: string | null;
  flair_thumb_url: string | null;
};

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const toast = useToast();

  const load = async () => {
    setLoading(true); setErr(undefined);
    try {
      await api.touchLogin();
      const d = (await api.profileMe()) as Me[] | null;
      setMe(d?.[0] ?? null);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unequipFlair = async () => {
    try { await api.unequipFlair(); toast('Flair unequipped'); await load(); }
    catch (e: any) { toast(e.message ?? 'Action failed'); }
  };

  return (
    <AuthGate>
      <div className="mb-5">
        <h1 className="h1">Profile</h1>
        <div className="subtle">Your identity and season progress.</div>
      </div>

      {loading && (
        <div className="card p-4 animate-pulse">
          <div className="h-4 w-40 bg-ink-800 rounded mb-2" />
          <div className="h-3 w-64 bg-ink-800 rounded mb-2" />
          <div className="h-3 w-48 bg-ink-800 rounded" />
        </div>
      )}

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {!loading && me && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold">{me.username} <span className="text-ink-300 text-base">({me.batch})</span></div>
              <div className="text-sm text-ink-300">User ID: <span className="text-ink-400">{me.user_id.slice(0,8)}…</span></div>
            </div>
            {me.flair_thumb_url && (
              <img src={me.flair_thumb_url} alt={me.flair_name ?? ''} className="w-12 h-12 rounded-lg bg-ink-800" />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Level" value={me.level} />
            <Stat label="XP" value={me.xp_total} />
            <Stat label="Coins" value={me.coins_balance} />
            <Stat label="Streak" value={`${me.streak_days}d`} />
          </div>

          <div className="pt-2">
            <div className="text-sm text-ink-300 mb-1">Flair</div>
            {me.flair_key ? (
              <div className="flex items-center gap-3">
                {me.flair_thumb_url && <img src={me.flair_thumb_url} alt={me.flair_name ?? ''} className="w-10 h-10 rounded bg-ink-800" />}
                <div className="text-sm">{me.flair_name}</div>
                <button className="btn btn-ghost" onClick={unequipFlair}>Unequip</button>
              </div>
            ) : (
              <div className="text-sm text-ink-400">None equipped</div>
            )}
          </div>
        </div>
      )}
    </AuthGate>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs uppercase text-ink-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
