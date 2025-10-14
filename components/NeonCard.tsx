"use client";
import React from "react";

type Accent = "cyan"|"lime"|"purple"|"pink"|"orange"|"magenta";
export default function NeonCard(
  { title, accent="cyan", className="", children }:{
    title?: string;
    accent?: Accent;
    className?: string;
    children: React.ReactNode;
  }
){
  const a = accent === "magenta" ? "pink" : accent;
  return (
    <div className={`neon-card ${className}`} data-accent={a}>
      {title ? <div className="neon-title">{title}</div> : null}
      {children}
    </div>
  );
}