import React from 'react';
import LoginClient from './LoginClient';

export const metadata = { title: 'Login В· Brain Heist' };

export default function Page() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] grid place-items-center overflow-hidden">
      {/* BG image (your art) вЂ” put something at /public/assets/ui/login-bg.jpg */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(126,255,202,.35),transparent_60%)]" />
      <div className="absolute inset-0 -z-20 bg-[url('/assets/ui/login-bg.jpg')] bg-cover bg-center opacity-[.16]" />
      {/* cyber grid */}
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(transparent_23px,rgba(255,255,255,.06)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.06)_24px)] bg-[size:24px_24px]" />
      {/* scanline */}
      <div className="absolute inset-0 pointer-events-none mix-blend-soft-light bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,.25)_3px)]" />

      <div className="w-full max-w-[420px] p-4">
        <div className="text-center mb-6">
          <div className="text-3xl font-extrabold tracking-wider">
            <span className="bh-glitch">BRAIN&nbsp;HEIST</span>
          </div>
          <div className="text-xs opacity-80 mt-1">Become a hacker. Beat the leaderboard.</div>
        </div>

        <LoginClient />
      </div>
    </div>
  );
}

