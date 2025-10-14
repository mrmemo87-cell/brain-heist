import * as React from "react";

type Accent = "cyan" | "lime" | "purple" | "pink" | "orange";

interface NeonCardProps {
  title?: string;
  subtitle?: string;       // <-- new
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
}

export default function NeonCard({
  title,
  subtitle,                // <-- new
  accent = "cyan",
  className,
  children,
}: NeonCardProps) {
  const glow =
    accent === "lime"
      ? "shadow-[0_0_24px_theme(colors.lime.500/60%)] ring-1 ring-lime-500/30"
      : accent === "purple"
      ? "shadow-[0_0_24px_theme(colors.purple.500/60%)] ring-1 ring-purple-500/30"
      : accent === "pink"
      ? "shadow-[0_0_24px_theme(colors.pink.500/60%)] ring-1 ring-pink-500/30"
      : accent === "orange"
      ? "shadow-[0_0_24px_theme(colors.orange.500/60%)] ring-1 ring-orange-500/30"
      : "shadow-[0_0_24px_theme(colors.cyan.500/60%)] ring-1 ring-cyan-500/30";

  return (
    <div
      className={[
        "rounded-2xl p-4 bg-[var(--c-card)]/90 border border-white/10",
        "backdrop-blur transition-all duration-500",
        "hover:translate-y-[-1px] hover:scale-[1.01]",
        glow,
        className ?? ""
      ].join(" ")}
    >
      {title && <div className="text-white/90 text-lg font-bold">{title}</div>}
      {subtitle && <div className="text-white/50 text-xs mb-2">{subtitle}</div>}
      {children}
    </div>
  );
}