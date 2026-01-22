'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';
import HackButton from '@/components/HackButton';

type Target = {
  uid: string;
  username: string | null;
  avatar_url: string | null;
  last_online_at: string | null;
};

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray((data as any).items)) return (data as any).items as T[];
  if (Array.isArray((data as any).list)) return (data as any).list as T[];
  if (Array.isArray((data as any).data)) return (data as any).data as T[];
  return [];
}
function timeAgo(iso?: string | null): string {
  if (!iso) return 'вЂ”';
  const d = new Date(iso).getTime();
  const now = Date.now();
  let s = Math.max(0, Math.round((now - d) / 1000));
  const day = 86400, hr = 3600, min = 60;
  if (s < 60) return `${s}s ago`;
  const days = Math.floor(s / day); s %= day;
  const hours = Math.floor(s / hr); s %= hr;
  const mins = Math.floor(s / min);
  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

export default function TargetsList() {
  const supa = supabase;
  const [needLogin, setNeedLogin] = useState(false);
  const [batch, setBatch] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [settingBatch, setSettingBatch] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        setNeedLogin(true);
        setTargets([]);
        setBatch(null);
        return;
      }
      setNeedLogin(false);

      const { data: me, error: meErr } = await supabase
        .from('users')
        .select('batch')
        .eq('uid', uid)
        .maybeSingle();
      if (meErr) throw new Error(meErr.message);

      const myBatch =
        me && typeof (me as any).batch === 'string' && (me as any).batch.length > 0
          ? ((me as any).batch as string)
          : null;
      setBatch(myBatch);

      const { data, error } = await supabase.rpc('rpc_hack_targets');
      if (error) throw new Error(error.message);
      setTargets(toArray<Target>(data));
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load targets');
      setTargets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function setMyBatch(b: '8A'|'8B'|'8C') {
    setSettingBatch(true);
    setErr(null);
    try {
      const { error } = await supabase.rpc('rpc_set_batch', { p_batch: b });
      if (error) throw new Error(error.message);
      setBatch(b);
      await load();
    } catch (e:any) {
      setErr(e?.message ?? 'Failed to set batch');
    } finally {
      setSettingBatch(false);
    }
  }

  if (needLogin) {
    return (
      <div className="rounded-2xl p-4 bg-[var(--c-card)]/70 text-sm">
        YouвЂ™re not signed in. <a href="/login" className="underline">Log in</a> to see targets in your batch.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {err && <div className="text-sm rounded-xl bg-rose-500/15 border border-rose-500/40 p-3">{err}</div>}

      {!batch && (
        <div className="rounded-2xl p-4 bg-[var(--c-surface)]/80 text-sm flex items-center gap-2">
          Your account has no batch yet.
          <button
            disabled={settingBatch}
            onClick={() => void setMyBatch('8A')}
            className="px-3 py-2 rounded-xl bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50 text-sm"
          >
            {settingBatch ? 'SettingвЂ¦' : 'Set my batch to 8A'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="opacity-70 text-sm">Loading targetsвЂ¦</div>
      ) : targets.length === 0 ? (
        <div className="opacity-70 text-sm">No targets in your batch yet.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {targets.map((t) => (
            <li key={t.uid} className="rounded-2xl p-3 bg-[var(--c-card)]/70 shadow flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/30 overflow-hidden flex items-center justify-center">
                  {t.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs opacity-80">рџ‘¤</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.username ?? t.uid.slice(0, 6)}</div>
                  <div className="text-[11px] opacity-70">
                    Online: {timeAgo(t.last_online_at)}
                  </div>
                </div>
              </div>
              <HackButton target={t.uid} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

