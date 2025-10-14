"use client";
import React from "react";

export default function RollingCoin({
  trigger = 0,
  className = "",
}: {
  trigger?: number;
  className?: string;
}) {
  // Key on `trigger` so animation restarts when the number changes
  return (
    <div className={className} style={{ perspective: 400 }}>
      <div key={trigger} className="inline-flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 ring-2 ring-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.75)] grid place-items-center text-[11px] font-extrabold text-amber-900 coin-spin">
          ¢
        </div>
      </div>
      <style jsx>{`
        @keyframes coinFlip {
          0%   { transform: rotateY(0deg) scale(1);   filter: brightness(1); }
          50%  { transform: rotateY(180deg) scale(1.05); filter: brightness(1.2); }
          100% { transform: rotateY(360deg) scale(1);  filter: brightness(1); }
        }
        .coin-spin { animation: coinFlip 800ms linear; transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}