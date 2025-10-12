'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supa';
import { useAudio } from '@/components/AudioProvider';

type Props = {
  // primary new prop:
  defenderUid?: string;
  // legacy alias so older components still compile:
  defenderId?: string;
  className?: string;
  onAfter?: () => void;
};

export default function HackButton({ defenderUid, defenderId, className = '', onAfter }: Props) {
  const supa = supabase;
  const sfx = useAudio();
  const [loading, setLoading] = useState(false);

  const def = defenderUid ?? defenderId ?? '';

  async function onHack() {
    if (!def || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_hack_attempt', { _def: def });
      if (error) throw new Error(error.message);

      const row = Array.isArray(data) ? (data as any[])[0] : null;
      const outcome: string = String(row?.outcome ?? 'fail').toLowerCase();

      if (outcome === 'win' || outcome === 'success') await sfx.hackWin?.();
      else await sfx.hackFail?.();

      onAfter?.();
    } catch {
      await sfx.hackFail?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void onHack()}
      disabled={!def || loading}
      className={`px-3 py-2 rounded-xl bg-[var(--c-primary)]/80 hover:opacity-90 disabled:opacity-50 ${className}`}
    >
      {loading ? 'HackingвЂ¦' : 'Hack'}
    </button>
  );
}

