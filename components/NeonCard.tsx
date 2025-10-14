import React from "react";

export type Accent = "cyan" | "lime" | "purple" | "pink" | "orange";

type Props = {
  title?: string;
  subtitle?: string; // new
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
};

export default function NeonCard({ title, subtitle, accent = "cyan", className = "", children }: Props) {
  const ring =
    ({
      cyan:   "shadow-[0_0_15px_#00ffff55] ring-1 ring-cyan-400/20",
      lime:   "shadow-[0_0_15px_#adff2f55] ring-1 ring-lime-400/20",
      purple: "shadow-[0_0_15px_#bf00ff55] ring-1 ring-purple-400/20",
      pink:   "shadow-[0_0_15px_#ff2d9155] ring-1 ring-pink-400/20",
      orange: "shadow-[0_0_15px_#ff990055] ring-1 ring-orange-400/20",
    } as const)[accent] ?? "";

  const cls = [
    "rounded-2xl p-4 border border-white/10 bg-[rgba(255,255,255,0.03)]",
    "backdrop-blur-md transition-all duration-300",
    "hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
    ring,
    className,
  ].join(" ");

  return (
    <div className={cls}>
      {title && <div className="text-xs font-bold uppercase opacity-90 mb-1 tracking-wide">{title}</div>}
      {subtitle && <div className="text-[11px] opacity-70 mb-2 italic">{subtitle}</div>}
      <div>{children}</div>
    </div>
  );
}