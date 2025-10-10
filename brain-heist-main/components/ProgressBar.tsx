'use client';
export default function ProgressBar({ value, max, label }:{ value:number; max:number; label?:string }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1,max)) * 100)));
  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-ink-300">{label}</div>}
      <div className="h-3 w-full rounded-full bg-ink-900 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
             style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-ink-400">{pct}%</div>
    </div>
  );
}
