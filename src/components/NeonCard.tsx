import React, { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  accent?: string; // e.g. "purple", "green", "orange", "cyan", "lime", "pink"
};

const accentClass = (a?: string) => {
  switch (a) {
    case "purple": return "ring-2 ring-purple-500/40";
    case "green":  return "ring-2 ring-emerald-400/40";
    case "orange": return "ring-2 ring-orange-400/40";
    case "red":    return "ring-2 ring-rose-400/40";
    case "cyan":   return "ring-2 ring-cyan-400/40";
    case "lime":   return "ring-2 ring-lime-400/40";
    case "pink":   return "ring-2 ring-pink-400/40";
    default:       return "ring-1 ring-white/5";
  }
};

/**
 * NeonCard (enhanced stub) вЂ” accepts title, subtitle & accent props.
 * Replace with your real UI later.
 */
export default function NeonCard({ children, className = "", title, subtitle, accent }: Props) {
  return (
    <div className={`p-4 rounded-lg shadow bg-[rgba(255,255,255,0.03)] ${accentClass(accent)} ${className}`}>
      {title ? (
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle ? <div className="text-sm text-muted-foreground mt-0.5">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}