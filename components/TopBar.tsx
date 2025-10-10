'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/rpc';
import { SFX } from '@/lib/sfx';

type Me = { username: string; coins_balance: number; xp_total: number; user_id: string | null };

export default function TopBar() {
  const [me, setMe] = useState<Me | null>(null);

  // Load profile once
  useEffect(() => {
    (async () => {
      try {
        const d = await api.profileMe();
        setMe((d as any[])?.[0] ?? null);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  // One-time audio unlock on first user gesture
  useEffect(() => {
    const onFirst = () => {
      SFX.unlock();
      window.removeEventListener('pointerdown', onFirst);
    };
    window.addEventListener('pointerdown', onFirst);
    return () => window.removeEventListener('pointerdown', onFirst);
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-ink-950/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 blur-lg rounded-full bg-cyan-500/30 group-hover:bg-fuchsia-500/30 transition-colors" />
            <div className="relative w-8 h-8 grid place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white font-black">
              BH
            </div>
          </div>
          <div className="text-white/90 font-semibold tracking-wide">Brain Heist</div>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/tasks" className="px-2 py-1 rounded-md hover:bg-white/10">Tasks</Link>
          <Link href="/shop" className="px-2 py-1 rounded-md hover:bg-white/10">Shop</Link>
          <Link href="/profile" className="px-2 py-1 rounded-md hover:bg-white/10">Profile</Link>
          <Link href="/leaderboard" className="px-2 py-1 rounded-md hover:bg-white/10">Leaderboard</Link>

          {me ? (
            <>
              <span className="px-2 py-1 rounded-md bg-white/5">{me.username}</span>
              <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-300">🟡 {me.coins_balance ?? 0}c</span>
              <span className="px-2 py-1 rounded-md bg-violet-500/15 text-violet-300">⭐ {me.xp_total ?? 0} XP</span>
              <Link href="/logout" className="px-2 py-1 rounded-lg bg-white/10">Logout</Link>
            </>
          ) : (
            <Link href="/login" className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md shadow-cyan-500/20">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
