import React from "react";

type Props = { value: number; size?: number };
export function RadialGauge({ value, size=110 }: Props){
  const v = Math.max(0, Math.min(100, value));
  const r = 48, c = 2*Math.PI*r, off = c*(1 - v/100);
  const color = v > 66 ? "#3af46f" : v > 33 ? "#ffd24a" : "#ff5a6b";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none"/>
      <circle cx="60" cy="60" r={r} stroke={color} strokeWidth="10" fill="none"
        strokeDasharray={`${c} ${c}`} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 60 60)"/>
      <text x="60" y="65" textAnchor="middle" fontSize="22" fill="#e8f0ff" fontWeight="800">
        {v}%
      </text>
    </svg>
  );
}
export default RadialGauge;