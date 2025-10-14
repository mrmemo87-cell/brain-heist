import * as React from "react";

export type RadialGaugeProps = {
  value: number;           // 0..100
  size?: number;           // px
  stroke?: number;         // px
  reverse?: boolean;       // draw remaining instead of progress
  className?: string;
};

function RadialGaugeComp({
  value,
  size = 120,
  stroke = 10,
  reverse = false,
  className,
}: RadialGaugeProps) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = reverse ? (100 - v) : v;
  const dash = (pct / 100) * c;

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeOpacity="0.15" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontWeight="800" fontSize={size*0.22}>
        {Math.round(v)}%
      </text>
    </svg>
  );
}

// default export
export default RadialGaugeComp;
// named export for `import { RadialGauge }`
export { RadialGaugeComp as RadialGauge };