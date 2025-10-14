"use client";
import React from "react";

function colorFor(v:number){
  // 100 -> green, 50 -> yellow, 0 -> red
  const clamp = Math.max(0, Math.min(100, v));
  const r = clamp < 50 ? Math.round( (50-clamp)/50 * 255 ) : 0;
  const g = clamp >= 50 ? 255 : Math.round( clamp/50 * 255 );
  return `rgb(${r},${g},80)`;
}

export default function RadialGauge(
  { value=0, reverse=false, size=110, stroke=10 }:{
    value?: number; reverse?: boolean; size?: number; stroke?: number;
  }
){
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const p = reverse ? (100 - pct) : pct;
  const dash = (p/100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius}
        stroke="rgba(255,255,255,.10)" strokeWidth={stroke}
        fill="none" />
      <circle cx={size/2} cy={size/2} r={radius}
        stroke={colorFor(pct)} strokeWidth={stroke}
        fill="none" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ-dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}