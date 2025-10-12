'use client';

import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/supa';

type Counts = { [emoji: string]: number };

export default function Reactions({ ts, initial }: { ts: string; initial?: Counts }) {
  const supa = supabase;
  const [counts, setCounts] = useState<Counts>(initial ?? { 'рџ”Ґ': 0, 'рџ€': 0, 'рџ›ЎпёЏ': 0, 'рџ­': 0 });
  const [busy, setBusy] = useState<string | null>(null);

  async function react(emoji: 'рџ”Ґ'|'рџ€'|'рџ›ЎпёЏ'|'рџ­') {
    if (busy) return;
    setBusy(emoji);
    try {
      setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
      const { error } = await supabase.rpc('rpc_react', { p_event_ts: ts, p_emoji: emoji });
      if (error) throw new Error(error.message);
    } catch {
      // best-effort; ignore failure (RLS/dup) for UX
      setCounts(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 1) - 1) }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {(['рџ”Ґ','рџ€','рџ›ЎпёЏ','рџ­'] as const).map(e => (
        <button
          key={e}
          disabled={busy!==null}
          onClick={()=>void react(e)}
          className="px-2 py-1 rounded-lg bg-[var(--c-card)]/70 hover:opacity-90 disabled:opacity-50"
        >
          {e} {counts[e] ?? 0}
        </button>
      ))}
    </div>
  );
}

