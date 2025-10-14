"use client";
import React from "react";

export default function NeonAvatar({ size = 140, xp = 0 }: { size?: number; xp?: number }) {
  // simple rank by xp ranges
  const rank = xp > 3000 ? "Legend" : xp > 1500 ? "Elite" : xp > 500 ? "Pro" : "Rookie";
  const badgeColor = xp > 3000 ? "linear-gradient(90deg,#ff3cac,#784ba0)" :
                     xp > 1500 ? "linear-gradient(90deg,#06b6d4,#7c3aed)" :
                     xp > 500 ? "linear-gradient(90deg,#22c55e,#84cc16)" :
                     "linear-gradient(90deg,#94a3b8,#64748b)";

  return (
    <div style={{ width: size, textAlign: "center" }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: "999px",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), rgba(0,0,0,0.45))",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.25) inset",
        border: "3px solid rgba(255,255,255,0.03)",
        display: "inline-block",
        position: "relative",
        overflow: "visible"
      }}>
        {/* placeholder avatar circle */}
        <div style={{
          width: "76%",
          height: "76%",
          borderRadius: "999px",
          margin: "12% auto",
          background: "linear-gradient(135deg,#0ea5e9,#7c3aed)",
          boxShadow: "0 0 30px rgba(124,58,237,0.5), 0 6px 20px rgba(0,0,0,0.5)",
          transform: "translateZ(0)"
        }} />
      </div>

      <div style={{
        marginTop: 8,
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        backgroundImage: badgeColor,
        color: "white",
        fontWeight: 700,
        boxShadow: "0 6px 18px rgba(0,0,0,0.5)"
      }}>{rank}</div>
    </div>
  );
}