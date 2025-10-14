"use client";

import React, { useMemo } from "react";

export function NeonBar({
  value = 0,           // 0..100
  reverse = true,      // visually "counting down"
  height = 10,
}: {
  value?: number;
  reverse?: boolean;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const style = useMemo(() => ({
    height: `${height}px`,
    width: `${pct}%`,
  }), [pct, height]);

  return (
    <div className="w-full rounded-full bg-white/10 border border-white/20 overflow-hidden">
      <div
        className={`h-full ${reverse ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-fuchsia-400 via-cyan-300 to-emerald-300 animate-[pulse_2s_ease-in-out_infinite]`}
        style={style}
      />
    </div>
  );
}