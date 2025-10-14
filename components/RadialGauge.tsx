export function RadialGauge({ value=67, size=126 }: { value:number; size?:number }) {
  const r = (size-16)/2;
  const c = 2*Math.PI*r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct/100)*c;
  return (
    <div style={{ width:size, height:size }} className="relative grid place-items-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,.12)" strokeWidth="12" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#g)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${dash} ${c-dash}`} fill="none" />
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00f0ff" />
            <stop offset="60%"  stopColor="#ff00e6" />
            <stop offset="100%" stopColor="#aaff00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-2xl font-extrabold drop-shadow-neon">{pct}%</div>
    </div>
  );
}