"use client";

import * as React from "react";

type Accent = "cyan" | "lime" | "purple" | "pink" | "orange" | "mag";

type NeonCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  accent?: Accent;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  tabIndex?: number;
  children?: React.ReactNode;
};

const ACCENTS: Record<
  Accent,
  { glow: string; ring: string; gradFrom: string; gradTo: string; text: string }
> = {
  cyan:   { glow: "rgba(34,211,238,0.6)", ring: "ring-cyan-300/60", gradFrom: "from-cyan-400",   gradTo: "to-cyan-600",   text: "text-cyan-200" },
  lime:   { glow: "rgba(132,204,22,0.6)", ring: "ring-lime-300/60", gradFrom: "from-lime-400",   gradTo: "to-lime-600",   text: "text-lime-200" },
  purple: { glow: "rgba(168,85,247,0.6)", ring: "ring-purple-300/60", gradFrom: "from-purple-400", gradTo: "to-purple-600", text: "text-purple-200" },
  pink:   { glow: "rgba(236,72,153,0.6)", ring: "ring-pink-300/60", gradFrom: "from-pink-400",   gradTo: "to-pink-600",   text: "text-pink-200" },
  orange: { glow: "rgba(251,146,60,0.6)", ring: "ring-orange-300/60", gradFrom: "from-orange-400", gradTo: "to-orange-600", text: "text-orange-200" },
  mag:    { glow: "rgba(217,70,239,0.65)", ring: "ring-fuchsia-300/60", gradFrom: "from-fuchsia-400", gradTo: "to-pink-600", text: "text-fuchsia-200" },
};

// simple className joiner
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function NeonCard({
  title,
  subtitle,
  footer,
  accent = "cyan",
  hover = true,
  className,
  onClick,
  as: Tag = "div",
  role,
  tabIndex,
  children,
}: NeonCardProps) {
  const a = ACCENTS[accent] ?? ACCENTS.cyan;

  // soft neon glow
  const glowStyle: React.CSSProperties = {
    boxShadow: `0 0 1.2rem ${a.glow}, inset 0 0 0.6rem ${a.glow.replace("0.6", "0.25")}`,
  };

  return (
    <Tag
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      className={cx(
        // base card
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
        "ring-1 " + a.ring,
        "transition-all duration-300",
        hover && "hover:translate-y-[-2px] hover:scale-[1.01]",
        "p-4 sm:p-5",
        className
      )}
      style={glowStyle}
    >
      {/* Gradient edge overlay */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-gradient-to-br opacity-25",
          a.gradFrom,
          a.gradTo
        )}
      />

      {/* Shimmer line on hover */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.3),transparent)]",
          "opacity-0 transition-opacity duration-300",
          hover && "hover:opacity-100"
        )}
      />

      {/* Content layer */}
      <div className="relative">
        {(title || subtitle) && (
          <header className="mb-2">
            {subtitle ? (
              <div className={cx("text-[11px] tracking-wide uppercase", a.text)}>
                {subtitle}
              </div>
            ) : null}
            {title ? (
              <h3 className="mt-0.5 text-lg font-semibold text-white">{title}</h3>
            ) : null}
          </header>
        )}

        <div className="text-white">{children}</div>

        {footer ? <footer className="mt-3 text-sm text-white/80">{footer}</footer> : null}
      </div>
    </Tag>
  );
}
