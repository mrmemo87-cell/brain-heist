"use client";
import { useEffect, useState } from "react";
import { makeBHClient } from "@/lib/bhClient";

const bh = makeBHClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Cool = { allowed: boolean; seconds_left: number };

export default function HackButton({ defenderUuid }: { defenderUuid: string }) {
  const [cool, setCool] = useState<Cool | null>(null);

  const disabled = !!cool && !cool.allowed;

  async function refreshCooldown() {
    const rows = await bh.unwrap<Cool[]>(bh.rpc.rpc_hack_cooldown(defenderUuid));
    setCool(rows?.[0] ?? { allowed: true, seconds_left: 0 });
  }

  useEffect(() => {
    refreshCooldown();
  }, [defenderUuid]);

  // optional: local ticker so seconds decrease smoothly
  useEffect(() => {
    if (!cool?.seconds_left) return;
    const id = setInterval(() => {
      setCool(c => (c ? { ...c, seconds_left: Math.max(0, c.seconds_left - 1) } : c));
    }, 1000);
    return () => clearInterval(id);
  }, [cool?.seconds_left]);

  return (
    <button
      disabled={disabled}
      className="btn btn-primary disabled:opacity-60"
      onClick={async () => {
        try {
          const r = await bh.unwrap<any>(bh.rpc.rpc_hack_attempt(defenderUuid));
          // TODO: toast + SFX based on r.outcome (win/lose/blocked)
        } finally {
          await refreshCooldown();
        }
      }}
      title={!cool ? "" : (!cool.allowed && cool.seconds_left === 0 ? "Daily hack limit reached" : "")}
    >
      {disabled ? `Cooldown ${cool?.seconds_left ?? 0}s` : "Hack"}
    </button>
  );
}
