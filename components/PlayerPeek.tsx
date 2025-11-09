'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import HackButton from '@/components/HackButton';
import { api } from '@/lib/rpc';

type PeekUser = {
  user_id: string;
  username: string;
  batch?: string | null;
  level?: number | null;
  xp_total?: number | null;
  avatar_url?: string | null;
};

export default function PlayerPeek({
  open,
  onClose,
  seed, // minimal info to open fast
}: {
  open: boolean;
  onClose: () => void;
  seed: { user_id: string; username: string; batch?: string | null; level?: number | null; xp_total?: number | null };
}) {
  const [row, setRow] = useState<PeekUser>(seed);

  // Try to enrich with avatar if your profile endpoint can return other users by id.
  useEffect(() => {
    if (!open) return;
    // If you have an RPC to fetch other profile by id, use it here.
    // Fallback: keep seed.
    (async () => {
      try {
        // Example (replace with your own RPC if available):
        // const d = await api.rpc<any[]>('rpc_profile_by_id', { _user_id: seed.user_id });
        // setRow(d?.[0] ?? seed);
        setRow(seed);
      } catch {
        setRow(seed);
      }
    })();
  }, [open, seed]);

  if (!open) return null;

  const avatar = row.avatar_url || '/avatar-placeholder.png'; // will show image if you add one later
  const rankName = (xp: number | null | undefined) => {
    const v = xp ?? 0;
    if (v >= 5000) return 'Mythic';
    if (v >= 2500) return 'Legend';
    if (v >= 1200) return 'Diamond';
    if (v >= 600) return 'Platinum';
    if (v >= 300) return 'Gold';
    if (v >= 120) return 'Silver';
    return 'Bronze';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card p-5 w-full max-w-md relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-ink-300 hover:text-white"
          aria-label="Close"
        >
          вњ•
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-800 grid place-items-center">
            {/* If you store avatars in Supabase Storage, point avatar URL here */}
            <Image src={avatar} alt={row.username} width={64} height={64} className="object-cover" />
          </div>
          <div>
            <div className="text-xl font-bold">{row.username}</div>
            <div className="text-xs text-ink-400">
              Batch <b>{row.batch ?? '-'}</b> вЂў Rank:{' '}
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30">
                {rankName(row.xp_total)}
              </span>
            </div>
            <div className="text-xs text-ink-400">
              XP: <b className="text-violet-300">{row.xp_total ?? 0}</b> вЂў Level:{' '}
              <b className="text-cyan-300">{row.level ?? '-'}</b>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <HackButton target={row.user_id} />
        </div>

        <div className="mt-4 text-xs text-ink-400">
          Tip: success depends on win chance and enemy shields. Cooldown applies after each attempt.
        </div>
      </div>
    </div>
  );
}

