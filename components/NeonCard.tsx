import React, { ReactNode } from "react";

type Props = {
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  accent?: string; // e.g. "purple", "green", "orange"
};

const accentClass = (a?: string) => {
  switch (a) {
    case "purple": return "ring-2 ring-purple-500/40";
    case "green":  return "ring-2 ring-emerald-400/40";
    case "orange": return "ring-2 ring-orange-400/40";
    case "red":    return "ring-2 ring-rose-400/40";
    default:       return "ring-1 ring-white/5";
  }
};

/**
 * NeonCard (enhanced stub) РІР‚вЂќ accepts title & accent props so pages can render headers.
 * Replace with your real UI later.
 */
export default function NeonCard({ children, className = "", title, accent }: Props) {
  return (
    <div className={`p-4 rounded-lg shadow bg-[rgba(255,255,255,0.03)] ${accentClass(accent)} ${className}`}>
      {title ? <div className="mb-2"><h3 className="text-lg font-semibold">{title}</h3></div> : null}
      {children}
    </div>
  );
}