"use client";
export default function ProgressBar(
  { value=0, reverse=false, height=10, className="" }:{
    value?: number; reverse?: boolean; height?: number; className?: string;
  }
){
  const pct = Math.max(0, Math.min(100, value));
  const w = reverse ? (100 - pct) : pct;
  return (
    <div className={`neon-bar ${className}`} style={{height}}>
      <div className="neon-bar__fill" style={{ width: `${w}%` }} />
    </div>
  );
}