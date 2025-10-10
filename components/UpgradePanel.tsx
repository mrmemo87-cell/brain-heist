'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { useAudio } from '@/components/AudioProvider';

type UserRow = {
  uid: string;
  xp: number;
  creds: number;
  hack_level: number;
  sec_level: number;
};

export default function UpgradePanel() {
  const supa = supabase;
  const sfx = useAudio();

  const [me, setMe] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'hack' | 'sec' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      if (!uid) { window.location.href = '/login'; return; }

      // ensure rows exist (no-throw)
      try { await supabase.rpc('rpc_session_start'); } catch {}

      const { data, error } = await supabase
        .from('users')
        .select('uid,xp,creds,hack_level,sec_level')
        .eq('uid', uid)
        .maybeSingle();

      if (error) throw new Error(error.message);
      const r = (data ?? {}) as any;
      setMe({
        uid: uid,
        xp: Number(r.xp ?? 0),
        creds: Number(r.creds ?? 0),
        hack_level: Number(r.hack_level ?? 1),
        sec_level: Number(r.sec_level ?? 1),
      });
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }

  async function doUpgrade(stat: 'hack' | 'sec') {
    if (!me || busy) return;
    setBusy(stat);
    setErr(null);
    try {
      // server does all checks, updates users.xp/creds/levels and logs an event
      const { data, error } = await supabase.rpc('rpc_upgrade_stat', { p_stat: stat });
      if (error) throw new Error(error.message);

      // friendly sound
      await sfx.level?.();

      // refresh my row
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Upgrade failed');
      await sfx.wrong?.();
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return (
    <section className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10">
      <div className="opacity-70 text-sm">Loading powers…</div>
    </section>
  );

  if (!me) return null;

  return (
    <section className="rounded-2xl p-4 bg-[var(--c-card)]/70 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Upgrades</h3>
        <div className="text-xs opacity-70">✨ {me.xp} · 💰 {me.creds}</div>
      </div>

      {err && (
        <div className="text-xs rounded-xl bg-rose-500/15 border border-rose-500/40 p-2">{err}</div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl p-3 bg-black/20 border border-white/10">
          <div className="text-sm font-medium">Hacking Skill</div>
          <div className="text-xs opacity-70 mb-2">Level {me.hack_level}</div>
          <button
            disabled={!!busy}
            onClick={() => void doUpgrade('hack')}
            className="px-3 py-2 rounded-xl text-sm bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50"
          >
            {busy === 'hack' ? 'Upgrading…' : 'Upgrade Hack'}
          </button>
        </div>

        <div className="rounded-xl p-3 bg-black/20 border border-white/10">
          <div className="text-sm font-medium">Security Level</div>
          <div className="text-xs opacity-70 mb-2">Level {me.sec_level}</div>
          <button
            disabled={!!busy}
            onClick={() => void doUpgrade('sec')}
            className="px-3 py-2 rounded-xl text-sm bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50"
          >
            {busy === 'sec' ? 'Upgrading…' : 'Upgrade Security'}
          </button>
        </div>
      </div>

      <div className="text-[11px] opacity-60">
        Upgrades cost coins and may bump your rank based on XP. You’ll see the feed log it live.
      </div>
    </section>
  );
}
