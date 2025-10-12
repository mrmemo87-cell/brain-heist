"use client";
import React from "react";

export function ProgressBar({
  value,            // 0..1
  reverse = false,
  className = "",
  height = 10,
}: { value: number; reverse?: boolean; className?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value ?? 0));
  const pct = Math.round(v * 100);
  const fillStyle = reverse
    ? { width: `${100 - pct}%` }
    : { width: `${pct}%` };

  return (
    <div
      className={`relative rounded-full bg-white/10 overflow-hidden border border-white/15 ${className}`}
      style={{ height }}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400
                   shadow-[0_0_20px_rgba(56,189,248,.5)]
                   transition-all duration-500 ease-out"
        style={fillStyle}
      />
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30" />
    </div>
  );
}
