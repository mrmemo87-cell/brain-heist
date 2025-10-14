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
  const accents =
  cyan: "from-cyan-400 to-cyan-600",
  lime: "from-lime-400 to-lime-600",
  purple: "from-purple-400 to-purple-600",
  pink: "from-pink-400 to-pink-600",
  orange: "from-orange-400 to-orange-600",
  mag: "from-fuchsia-400 to-pink-600", // 💖 magenta gradient
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
