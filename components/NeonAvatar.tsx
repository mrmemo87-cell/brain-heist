"use client";
export default function NeonAvatar(
  { size=64, className="" }:{ size?: number; className?: string }
){
  return (
    <div
      className={className}
      style={{
        width:size, height:size, borderRadius:"50%",
        background:"linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        border:"1px solid rgba(255,255,255,.2)",
        boxShadow:"0 0 24px rgba(0,255,255,.35), inset 0 0 20px rgba(255,255,255,.06)"
      }}
    />
  );
}