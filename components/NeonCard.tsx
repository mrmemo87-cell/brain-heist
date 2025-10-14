import React from "react";

export type Accent = "cyan" | "lime" | "purple" | "pink" | "orange";
const accentToShadow: Record<Accent,string> = {
  cyan:   "0 0 0 1px rgba(0,255,255,.25), 0 0 20px rgba(0,255,255,.18)",
  lime:   "0 0 0 1px rgba(170,255,0,.25), 0 0 20px rgba(170,255,0,.18)",
  purple: "0 0 0 1px rgba(150,120,255,.25), 0 0 20px rgba(150,120,255,.18)",
  pink:   "0 0 0 1px rgba(255, 80,180,.25), 0 0 20px rgba(255, 80,180,.18)",
  orange: "0 0 0 1px rgba(255,170, 40,.25), 0 0 20px rgba(255,170, 40,.18)",
};

type Props = {
  title?: string;
  subtitle?: string;
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
};

export default function NeonCard({ title, subtitle, accent="cyan", className="", children }: Props){
  const ring = accentToShadow[accent];
  return (
    <section
      className={`neon-card ${className}`}
      style={{
        boxShadow: ring,
        background: "linear-gradient(180deg, #1b2230, #151b24)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: 16
      }}
    >
      {(title || subtitle) && (
        <div className="flex items-baseline justify-between mb-2">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {subtitle && <div className="text-[11px] opacity-70">{subtitle}</div>}
        </div>
      )}
      {children}
    </section>
  );
}