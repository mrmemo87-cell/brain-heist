// app/leaderboard/page.tsx
import NeonCard from "@/components/NeonCard";
import Link from "next/link";
import React from "react";

const dummyPlayers = [
  { uid: "u1", name: "vapor", xp: 220, batch: "A" },
  { uid: "u2", name: "neo", xp: 198, batch: "A" },
  { uid: "u3", name: "byte", xp: 156, batch: "B" },
  { uid: "u4", name: "flux", xp: 120, batch: "B" },
];

const LiveMini = () => {
  "use client";
  const [feed, setFeed] = React.useState([
    "vapor won a raid +6 coins",
    "neo activated Double XP",
  ]);
  React.useEffect(() => {
    const t = setInterval(() => {
      setFeed((s) => [ `random event ${Math.floor(Math.random()*1000)}`, ...s ].slice(0,6));
    }, 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-2">
      {feed.map((f,i)=>(
        <div key={i} className="neon-border p-2 rounded">{f}</div>
      ))}
    </div>
  );
};

export default function LeaderboardPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold neon-text">Leaderboard</h2>
        <Link href="/" className="neon-btn">Home</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <NeonCard title="Top players" subtitle="Global leaderboard" accent="purple">
            <ol className="space-y-3">
              {dummyPlayers.sort((a,b)=>b.xp-a.xp).map((p, i) => (
                <li key={p.uid} className="neon-border p-3 rounded flex items-center justify-between">
                  <div>
                    <div className="font-semibold neon-text">{i+1}. {p.name}</div>
                    <div className="muted text-sm">batch {p.batch}</div>
                  </div>
                  <div className="text-sm muted">{p.xp} XP</div>
                </li>
              ))}
            </ol>
          </NeonCard>
        </section>

        <aside>
          <NeonCard title="Live feed" subtitle="realtime highlights" accent="cyan">
            <LiveMini />
          </NeonCard>
        </aside>
      </div>
    </main>
  );
}
