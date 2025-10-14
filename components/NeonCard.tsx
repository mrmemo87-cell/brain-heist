"use client";
import React, { ReactNode } from "react";

export type Accent = "cyan" | "lime" | "purple" | "pink" | "orange" | "mag";

export default function NeonCard({ title, accent = "cyan", children, className = "" }: {
  title?: string;
  accent?: Accent;
  className?: string;
  children: ReactNode;
}) {
  const ring = {
    cyan: "ring-cyan-400/30",
    lime: "ring-lime-400/25",
    purple: "ring-purple-400/25",
    pink: "ring-pink-400/25",
    orange: "ring-orange-400/25",
    mag: "ring-pink-500/25",
  }[accent || "cyan"];

  return (
    <div className={`rounded-2xl p-4 bg-[rgba(255,255,255,0.02)] border border-white/6 ${ring} ${className}`}>
      {title && <div className="text-xs font-semibold uppercase opacity-90 mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  );
}