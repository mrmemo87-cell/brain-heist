// app/activity/page.tsx
import React from "react";
import NeonCard from "@/components/NeonCard";
import Link from "next/link";

/**
 * Client-only small TargetsList & LiveFeed components are embedded inside this file
 * to avoid importing fragile external modules. They simulate interactions locally.
 */

function sampleTargets() {
  return [
    { uid: "a1", name: "neo", level: 5, bio: "Quiet hacker", lastSeenMins: 12 },
    { uid: "b2", name: "byte", level: 3, bio: "Loves challenges", lastSeenMins: 45 },
    { uid: "c3", name: "vapor", level: 7, bio: "Top of the batch", lastSeenMins: 5 },
  ];
}

/* Client components */
const TargetsList = () => {
  "use client";
  const [targets] = React.useState(sampleTargets());
  const [cooldowns, setCooldowns] = React.useState<Record<string, number>>({});

  function attemptHack(uid: string) {
    // simulate a hack: set 60s cooldown on that uid for the attacker
    setCooldowns((s) => ({ ...s, [uid]: 60 }));
    // countdown runner
    const t = setInterval(() => {
      setCooldowns((s) => {
        const v = (s[uid] ?? 0) - 1;
        if (v <= 0) {
          clearInterval(t);
          const n = { ...s }; delete n[uid]; return n;
        }
        return { ...s, [uid]: v };
      });
    }, 1000);
  }

  return (
    <div className="space-y-3">
      {targets.map((t) => (
        <div key={t.uid} className="flex items-center justify-between neon-border p-3 rounded-lg">
          <div>
            <div className="font-semibold neon-text">{t.name} <span className="muted text-sm">· lvl {t.level}</span></div>
            <div className="muted text-sm">{t.bio}</div>
          </div>

          <div className="flex flex-col items-end">
            <div className="muted text-sm">{t.lastSeenMins <= 40 ? "recent" : "offline"}</div>
            <div className="mt-2">
              {cooldowns[t.uid] ? (
                <button className="neon-btn muted" disabled>Cooling {cooldowns[t.uid]}s</button>
              ) : (
                <button className="neon-btn" onClick={() => attemptHack(t.uid)}>Hack</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LiveFeed = () => {
  "use client";
  const [items, setItems] = React.useState<string[]>([
    "vapor hacked neo — +5 coins",
    "byte activated Stealth Shield",
    "neo answered a question — +3 coins",
  ]);

  function react(idx: number, emoji: string) {
    const copy = [...items];
    copy[idx] = copy[idx] + "  " + emoji;
    setItems(copy);
  }

  return (
    <div className="space-y-2">
      <div className="muted text-sm">Live feed</div>
      {items.map((it, i) => (
        <div key={i} className="neon-border p-3 rounded-lg flex justify-between items-center">
          <div className="text-sm">{it}</div>
          <div className="flex gap-2">
            <button className="neon-btn" onClick={() => react(i, "🔥")}>🔥</button>
            <button className="neon-btn" onClick={() => react(i, "👏")}>👏</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ActivityPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold neon-text">Activity</h2>
        <Link href="/" className="neon-btn">Home</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <NeonCard title="Targets (your batch)" subtitle="Click to open mini peek" accent="cyan">
            <TargetsList />
          </NeonCard>
        </section>

        <aside>
          <NeonCard title="Live feed" subtitle="React & reactions" accent="pink">
            <LiveFeed />
          </NeonCard>
        </aside>
      </div>
    </main>
  );
}
