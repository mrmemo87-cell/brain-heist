"use client";
import React from "react";

export default function ProgressBar({ value = 0, height = 10, reverse = false }: {
  value?: number;
  height?: number;
  reverse?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const bg = `linear-gradient(90deg, rgb(16,185,129) 0%, rgb(250,204,21) 60%, rgb(244,63,94) 100%)`;
  const innerStyle: React.CSSProperties = {
    width: `${pct}%`,
    height: `${height}px`,
    background: bg,
    transition: "width 500ms ease",
    boxShadow: "0 0 8px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.02) inset",
  };
  const containerStyle: React.CSSProperties = {
    height: `${height}px`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.05))",
    borderRadius: "999px",
    overflow: "hidden",
  };
  if (reverse) {
    innerStyle.float = "right";
  }

  return (
    <div style={containerStyle} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div style={innerStyle} />
    </div>
  );
}