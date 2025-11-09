'use client';

import React from 'react';
import HackButton from '@/components/HackButton';

export default function PlayerPeek({
  uid,
  username,
  avatar_url,
  batch,
  rank,
  xp,
  creds,
}: {
  uid: string;
  username?: string | null;
  avatar_url?: string | null;
  batch?: string | null;
  rank?: number | null;
  xp?: number | null;
  creds?: number | null;
}) {
  return (
    <div className="rounded-2xl p-3 bg-[var(--c-card)]/70 shadow flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-black/30 flex items-center justify-center">
          {avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">рџ‘¤</span>
          )}
        </div>
        <div>
          <div className="text-sm font-medium">{username ?? uid.slice(0, 6)}</div>
          <div className="text-[11px] opacity-70">
            Batch {batch ?? 'вЂ”'} В· Rank {rank ?? 0} В· вњЁ {xp ?? 0} В· рџ’° {creds ?? 0}
          </div>
        </div>
      </div>
      <HackButton target={uid} />
    </div>
  );
}

