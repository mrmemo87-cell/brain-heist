import React from "react"

export type Accent = "cyan" | "lime" | "purple" | "pink" | "orange"

export default function NeonCard({
  title,
  subtitle,
  accent = "cyan",
  className = "",
  children,
}: {
  title?: string
  subtitle?: string   // ✅ added subtitle prop
  accent?: Accent
  className?: string
  children: React.ReactNode
}) {
  const ring = {
    cyan: "shadow-[0_0_15px_#00ffff55]",
    lime: "shadow-[0_0_15px_#adff2f55]",
    purple: "shadow-[0_0_15px_#bf00ff55]",
    pink: "shadow-[0_0_15px_#ff2d9155]",
    orange: "shadow-[0_0_15px_#ff990055]",
  }[accent]

  return (
    <div className={
      \ounded-2xl p-4 border border-white/10 bg-[rgba(255,255,255,0.03)]
       backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
       transition-all duration-300  \
    }>
      {title && <div className="text-xs font-bold uppercase opacity-90 mb-1 tracking-wide">{title}</div>}
      {subtitle && <div className="text-[11px] opacity-70 mb-2 italic">{subtitle}</div>}
      <div>{children}</div>
    </div>
  )
}
