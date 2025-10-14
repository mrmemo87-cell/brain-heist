"use client";
import React from "react";

type Props = { value: number; size?: number; stroke?: number; reverse?: boolean };

export default function RadialGauge({ value, size = 120, stroke = 12, reverse = false }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - v / 100);
  const gradId = "g1";
  // gradient stops: green -> yellow -> red
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <g transform={reverse ? "scale(-1,1)" : "scale(1,1)"}>
          <circle
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </g>
        <text x="0" y="6" textAnchor="middle" fontSize="18" fontWeight={700} fill="white">{v}%</text>
      </g>
    </svg>
  );
}