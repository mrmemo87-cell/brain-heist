'use client';

import React, { useEffect, useRef } from 'react';

// simple SFX map using your public/sounds/*
const SFX = {
  correct: () => new Audio('/sounds/correct.mp3').play(),
  wrong:   () => new Audio('/sounds/wrong.mp3').play(),
  collect: () => new Audio('/sounds/collect.mp3').play(),
  buy:     () => new Audio('/sounds/buy.mp3').play(),
  activate:() => new Audio('/sounds/activate.mp3').play(),
  level:   () => new Audio('/sounds/level_up.mp3').play(),
  hackWin: () => new Audio('/sounds/hack_win.mp3').play(),
  hackFail:() => new Audio('/sounds/hack_fail.mp3').play(),
};

// 👉 hook your pages/components can import
export function useAudio() {
  return SFX;
}

// bg music auto-start after first user gesture
export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/music/bg.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.35;

    const kick = async () => { try { await audioRef.current?.play(); } catch {} };
    window.addEventListener('pointerdown', kick, { once: true });

    return () => {
      window.removeEventListener('pointerdown', kick);
      audioRef.current?.pause();
    };
  }, []);

  return <>{children}</>;
}
