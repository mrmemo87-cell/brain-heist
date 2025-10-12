'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import { getUid } from '../../lib/auth';

type Me = {
  uid: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  batch: string | null;
  rank: number | null;
  xp: number | null;
  creds: number | null;
  hack_level: number | null;
  sec_level: number | null;
  streak: number | null;
};

type Effect = {
  id: number;
  item_key: string;
  effect: string;
  started_at: string;
  duration_seconds: number;
  expires_at: string | null;
};

export default function ProfilePage() {
  const supa = supabase;
  const [me, setMe] = useState<Me | null>(null);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [ach, setAch] = useState({ hacksWon: 0, tasksDone: 0, itemsOwned: 0 });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setErr(null); setLoading(true);
      try {
        const uid = await getUid(supabase);

        // ensure rows exist (safety if user came in with existing session)

        const [{ data: p }, { data: u }] = await Promise.all([
          supabase.from('profiles').select('uid,username,avatar_url,bio').eq('uid', uid).maybeSingle(),
          supabase.from('users').select('batch,rank,xp,creds,hack_level,sec_level,streak').eq('uid', uid).maybeSingle(),
        ]);

        setMe({
          uid,
          username: (p as any)?.username ?? null,
          avatar_url: (p as any)?.avatar_url ?? null,
          bio: (p as any)?.bio ?? null,
          batch: (u as any)?.batch ?? null,
          rank: Number((u as any)?.rank ?? 0),
          xp: Number((u as any)?.xp ?? 0),
          creds: Number((u as any)?.creds ?? 0),
          hack_level: Number((u as any)?.hack_level ?? 1),
          sec_level: Number((u as any)?.sec_level ?? 1),
          streak: Number((u as any)?.streak ?? 0),
        });

        const { data: fx } = await supabase
          .from('active_effects')
          .select('id,item_key,effect,started_at,duration_seconds,expires_at')
          .eq('user_id', uid)
          .order('started_at', { ascending: false });
        setEffects(((fx ?? []) as Effect[]));

        const [hacks, tasks, inv] = await Promise.all([
          supabase.from('hacks').select('id', { count: 'exact', head: true }).eq('attacker', uid).eq('success', true),
          supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('uid', uid).eq('correct', true),
          supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('uid', uid),
        ]);
        setAch({
          hacksWon: hacks.count ?? 0,
          tasksDone: tasks.count ?? 0,
          itemsOwned: inv.count ?? 0,
        });
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  return (
    <main className="space-y-5">
      <h1>Profile</h1>
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}
      {loading || !me ? (
        <div className="opacity-70 text-sm">LoadingвЂ¦</div>
      ) : (
        <>
          <section className="card border-glow flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black/30 overflow-hidden flex items-center justify-center">
              {me.avatar_url ? <img src={me.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">рџ‘¤</span>}
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{me.username ?? me.uid.slice(0, 6)}</div>
              <div className="text-xs opacity-80">Batch {me.batch ?? 'вЂ”'} В· Rank {me.rank ?? 0}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-[var(--c-card)]/70 text-sm">вњЁ {me.xp ?? 0}</div>
              <div className="px-3 py-2 rounded-xl bg-[var(--c-card)]/70 text-sm">рџ’° {me.creds ?? 0}</div>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-3">
            <div className="card"><div className="text-sm opacity-70 mb-2">Powers</div>
              <div className="text-sm">Hack skill: <b>{me.hack_level}</b></div>
              <div className="text-sm">Security level: <b>{me.sec_level}</b></div>
              <div className="text-sm">Streak: <b>{me.streak}</b> days</div>
            </div>
            <div className="card"><div className="text-sm opacity-70 mb-2">Achievements</div>
              <div className="text-sm">Hacks won: <b>{ach.hacksWon}</b></div>
              <div className="text-sm">Tasks solved: <b>{ach.tasksDone}</b></div>
              <div className="text-sm">Items owned: <b>{ach.itemsOwned}</b></div>
            </div>
            <div className="card"><div className="text-sm opacity-70 mb-2">Bio</div>
              <div className="text-sm opacity-90">{me.bio ?? 'вЂ”'}</div>
            </div>
          </section>

          <section className="card">
            <h2>Active Effects</h2>
            {effects.length === 0 ? <div className="opacity-70 text-sm mt-1">No active effects.</div> : (
              <ul className="mt-2 grid md:grid-cols-2 gap-2">
                {effects.map(e => (
                  <li key={e.id} className="rounded-xl bg-[var(--c-card)]/70 p-3 text-sm">
                    <div className="font-medium">{e.item_key}</div>
                    <div className="opacity-80 text-xs">Effect: {e.effect}</div>
                    <div className="opacity-80 text-xs">
                      Started {new Date(e.started_at).toLocaleString()}
                      {e.expires_at && <> В· Expires {new Date(e.expires_at).toLocaleTimeString()}</>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}


