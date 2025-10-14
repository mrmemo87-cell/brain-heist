import React from "react";

type Props = {
  value: number;          // 0..100
  size?: number;          // px
  reverse?: boolean;      // if true, visually conveys "counting down"
  label?: string;
};

function hueFor(v: number){ // green(120) -> yellow(55) -> red(0)
  if (v >= 66) return 120;        // green
  if (v >= 33) return 55;         // yellow
  return 0;                       // red
}

export function RadialGauge({ value, size=110, reverse=false, label }: Props){
  const v = Math.max(0, Math.min(100, value));
  const show = reverse ? v : v;   // keep %; "reverse" is only a semantic hint here
  const r = 48, c = 2*Math.PI*r, off = c*(1 - show/100);
  const hue = hueFor(show);
  const color = `hsl(${hue} 90% 55%)`;
  const glow  = `0 0 12px hsl(${hue} 90% 45% / .55)`;

  return (
    <div style={{filter:"saturate(1.15)"}}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <filter id="rg-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none"/>
        <circle cx="60" cy="60" r={r}
          stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 60 60)" filter="url(#rg-glow)" />
        <text x="60" y="65" textAnchor="middle" fontSize="20" fill="#e8f0ff" fontWeight="800">
          {show}%
        </text>
      </svg>
      {label && <div style={{marginTop:6, fontSize:12, opacity:.8, textAlign:"center"}}>{label}</div>}
    </div>
  );
}
export default RadialGauge;