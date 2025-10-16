import React, { ReactNode } from "react";

type Props = {
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  accent?: string; // e.g. "purple", "green", "orange", "cyan"
};

const accentClass = (a?: string) => {
  switch (a) {
    case "purple": return "neon-glow";
    case "green":  return "neon-glow";
    case "orange": return "neon-glow";
    case "red":    return "neon-glow";
    case "cyan":   return "neon-glow";
    default:       return "";
  }
};

/**
 * NeonCard — simple, pretty card that uses the global neon CSS helpers.
 * Replace with your fancier UI later; this is ready to render neon look.
 */
export default function NeonCard({ children, className = "", title, subtitle, accent }: Props) {
  return (
    <div className={`neon-border neon-inner p-4 rounded-lg ${accentClass(accent)} ${className}`}>
      {title ? (
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold neon-text leading-tight">{title}</h3>
            {subtitle ? <div className="muted text-sm mt-0.5">{subtitle}</div> : null}
          </div>
          <div className="text-sm muted">⚡</div>
        </div>
      ) : null}

      <div className="mt-2 text-sm">
        {children}
      </div>

      {/* sample actions (can be removed) */}
      <div className="mt-4 flex gap-2">
        <button className="neon-btn accent-cyan">Use</button>
        <button className="neon-btn accent-pink">Inspect</button>
      </div>
    </div>
  );
}
