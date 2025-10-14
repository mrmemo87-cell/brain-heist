"use client";

import { useEffect, useRef, useState } from "react";

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const v = window.localStorage.getItem("music");
        if (v === "off") setOn(false);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (on) {
      audioRef.current.volume = 0.25;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("music", on ? "on" : "off"); } catch {}
    }
  }, [on]);

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <audio ref={audioRef} loop src="/bg.mp3" />
      <button
        onClick={() => setOn(v => !v)}
        className="px-3 py-2 rounded-xl bg-black/70 text-white border border-white/10"
        aria-label="toggle music"
      >
        {on ? "🔊 On" : "🔇 Off"}
      </button>
    </div>
  );
}