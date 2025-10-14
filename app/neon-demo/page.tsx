"use client";

import NeonCard from "@/components/NeonCard";

export default function NeonDemoPage() {
  return (
    <main className="min-h-[80vh] max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Neon Card — Accent Gallery</h1>
      <p className="text-white/70 mt-1">Hover the cards to see the glow & shimmer.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <NeonCard accent="cyan"   title="Cyan Energy"   subtitle="accent: cyan">Crisp & cool vibes.</NeonCard>
        <NeonCard accent="lime"   title="Lime Surge"    subtitle="accent: lime">Fresh & punchy.</NeonCard>
        <NeonCard accent="purple" title="Purple Pulse"  subtitle="accent: purple">Regal neon glow.</NeonCard>
        <NeonCard accent="pink"   title="Pink Spark"    subtitle="accent: pink">Playful heat.</NeonCard>
        <NeonCard accent="orange" title="Orange Blaze"  subtitle="accent: orange">Warm highlight.</NeonCard>
        <NeonCard accent="mag"    title="Magenta Pop"   subtitle="accent: mag">Bold & flashy.</NeonCard>
      </div>
    </main>
  );
}
