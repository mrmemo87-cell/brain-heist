'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';

type Counts = Record<string, number>;

const EMOJIS = ['🔥', '😈', '🛡️', '😭'] as const;
type Emoji = typeof EMOJIS[number];

export default function ReactionBar({
  eventTs,
  counts = {},
  onChanged,
}: {
  eventTs: string;                // timestamptz from the feed (created_at == events.ts)
  counts?: Counts;                // aggregate counts (from view)
  onChanged?: () => void;         // parent can reload
}) {
  const supa = supabase;
  const [mine, setMine] = useState<Set<Emoji>>(new Set());
  const [local, setLocal] = useState<Counts>(() => ({ ...counts }));

  useEffect(() => setLocal({ ...counts }), [counts]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from('event_reactions')
        .select('emoji')
        .eq('event_ts', eventTs)
        .eq('uid', uid);
      if (!mounted) return;
      setMine(new Set(((data ?? []).map((r: any) => r.emoji) as Emoji[])));
    })();
    return () => { mounted = false; };
  }, [eventTs, supabase]);

  async function toggle(emoji: Emoji) {
    try {
      await supabase.rpc('rpc_react', { p_event_ts: eventTs, p_emoji: emoji });
      setMine(prev => {
        const next = new Set(prev);
        const had = next.has(emoji);
        if (had) next.delete(emoji); else next.add(emoji);
        return next;
      });
      setLocal(prev => {
        const v = (prev?.[emoji] ?? 0) + (mine.has(emoji) ? -1 : +1);
        return { ...prev, [emoji]: Math.max(0, v) };
      });
      onChanged?.();
    } catch { /* ignore */ }
  }

  return (
    <div className="flex items-center gap-3 text-[12px] opacity-80">
      {EMOJIS.map((e) => {
        const active = mine.has(e);
        return (
          <button
            key={e}
            onClick={() => void toggle(e)}
            className={`px-2 py-1 rounded-lg bg-[var(--c-card)]/70 hover:opacity-90 ${active ? 'ring-2 ring-[var(--c-primary)]' : ''}`}
            title={e}
          >
            <span className="mr-1">{e}</span>
            <span>{local?.[e] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
