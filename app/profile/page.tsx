// app/profile/page.tsx
import React from "react";
import NeonCard from "@/components/NeonCard";
import Link from "next/link";

/* Small client Inventory demo inside the page */
const InventoryPanel = () => {
  "use client";
  const [items, setItems] = React.useState([
    { key: "boost1", name: "XP Booster", qty: 1 },
    { key: "shield", name: "Mini Shield", qty: 2 }
  ]);
  const [active, setActive] = React.useState<Record<string, boolean>>({});

  function activate(key: string) {
    setActive((s) => ({ ...s, [key]: true }));
    setTimeout(() => setActive((s) => ({ ...s, [key]: false })), 8_000);
  }

  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.key} className="neon-border p-3 rounded-lg flex justify-between items-center">
          <div>
            <div className="font-semibold">{it.name} <span className="muted text-sm">x{it.qty}</span></div>
          </div>
          <div>
            <button className="neon-btn" onClick={() => activate(it.key)}>
              {active[it.key] ? "Active" : "Activate"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ProfilePage() {
  // server-side user summary (placeholder)
  const user = { name: "you", xp: 120, rank: "Script Kiddie", bio: "Learning to hack ethically" };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold neon-text">Profile</h2>
        <Link href="/" className="neon-btn">Home</Link>
      </header>

      <NeonCard title={user.name} subtitle={user.rank} accent="cyan">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="muted">XP</div>
            <div className="text-xl font-bold neon-text">{user.xp}</div>
            <div className="muted mt-2">Bio</div>
            <div>{user.bio}</div>
          </div>

          <div>
            <div className="muted">Inventory</div>
            <InventoryPanel />
          </div>
        </div>
      </NeonCard>
    </main>
  );
}
