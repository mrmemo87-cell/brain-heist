"use client";

import React from "react";

export default function NeonCard({
  title,
  accent = "cyan",
  children,
  className = "",
}: {
  title?: React.ReactNode;
  accent?: "cyan" | "lime" | "purple" | "pink" | "orange" | "mag";
  children?: React.ReactNode;
  className?: string;
}) {
  const glow =
    accent === "purple" ? "shadow-[0_0_30px_rgba(168,85,247,0.45)] border-purple-400/60"
  : accent === "pink"   ? "shadow-[0_0_30px_rgba(236,72,153,0.45)] border-pink-400/60"
  : accent === "lime"   ? "shadow-[0_0_30px_rgba(132,204,22,0.45)] border-lime-400/60"
  : accent === "orange" ? "shadow-[0_0_30px_rgba(251,146,60,0.45)] border-orange-400/60"
                        : "shadow-[0_0_30px_rgba(34,211,238,0.45)] border-cyan-400/60";

  return (
    <section className={`rounded-3xl bg-white/[0.04] backdrop-blur-md border ${glow} overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 text-xl font-extrabold tracking-tight bg-white/[0.06] border-b border-white/10">
          {title}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
