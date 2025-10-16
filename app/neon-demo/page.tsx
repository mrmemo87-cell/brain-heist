// app/neon-demo/page.tsx
import NeonCard from "@/components/NeonCard";
import Link from "next/link";

export default function NeonDemo() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold neon-text">Neon Demo</h2>
        <Link href="/" className="neon-btn">Home</Link>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NeonCard accent="cyan" title="Cyan Energy" subtitle="accent: cyan">
          Crisp & cool vibes.
        </NeonCard>

        <NeonCard accent="pink" title="Pink Spark" subtitle="accent: pink">
          Playful heat and pop.
        </NeonCard>

        <NeonCard accent="purple" title="Purple Pulse" subtitle="accent: purple">
          Regal glow for winners.
        </NeonCard>
      </div>

      <div className="mt-6">
        <div className="muted">Background & helpers</div>
        <ul className="list-disc ml-5 mt-2 muted">
          <li>Panels use <code>neon-border</code> and <code>neon-inner</code>.</li>
          <li>Callouts can use <code>neon-text</code> for glowing headings.</li>
        </ul>
      </div>
    </main>
  );
}
