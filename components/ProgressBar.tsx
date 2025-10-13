"use client";
import React from "react";

export function ProgressBar({
  value, reverse = false, className = "", height = 10,
}: { value: number; reverse?: boolean; className?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value ?? 0));
  const pct = Math.round(v * 100);
  const fillStyle = reverse ? { width: `${100 - pct}%` } : { width: `${pct}%` };

  return (
    <div
      className={`relative rounded-full bg-black/[.06] overflow-hidden border border-black/[.08] ${className}`}
      style={{ height }}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400
                   shadow-[0_0_20px_rgba(34,211,238,.35)]
                   transition-all duration-500 ease-out"
        style={fillStyle}
      />
    </div>
  );
}
