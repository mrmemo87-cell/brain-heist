import React from "react";

type Props = {
  value: number;           // 0..100
  reverse?: boolean;       // draw from right to left
  height?: number;         // px
  label?: string;
  glow?: boolean;
};

export default function ProgressBar({
  value,
  reverse = false,
  height = 10,
  label,
  glow = true,
}: Props) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "linear-gradient(90deg,#0b0b16,#0b0b16)",
        border: "1px solid rgba(255,255,255,0.12)",
        height,
      }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${v}%`,
          transformOrigin: reverse ? "right center" : "left center",
          background:
            "linear-gradient(90deg,#00f5d4,#00f,#8a2be2,#ff00aa)",
          filter: glow ? "drop-shadow(0 0 8px rgba(160,80,255,0.7))" : "none",
        }}
      />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] tracking-wide">
          {label}
        </div>
      )}
    </div>
  );
}