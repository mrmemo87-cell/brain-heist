"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import NeonCard from "@/components/NeonCard";
import { NeonBar } from "@/components/NeonBar";

type PublicProfile = {
  uid: string;
  name: string;
  bio: string | null;
  rank: number | null;
  xp: number | null;
  creds: number | null;
  hack_level: number | null;
  sec_level: number | null;
};

async function fetchPublic(uid: string): Promise<PublicProfile | null> {
  // Try SECURITY DEFINER RPC first (if you added it)
  try {
    const { data, error } = await supabase.rpc("rpc_profile_public", { p_uid: uid } as any);
    if (!error && Array.isArray(data) && data.length) {
      const r: any = data[0];
      return {
        uid: r.uid,
        name: r.name ?? "player",
        bio: r.bio ?? null,
        rank: r.rank ?? 0,
        xp: r.xp ?? 0,
        creds: r.creds ?? 0,
        hack_level: r.hack_level ?? 0,
        sec_level: r.sec_level ?? 0,
      };
    }
  } catch {}
  // Fallback: public.users only
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid,xp,creds,hack_level,sec_level,rank")
      .eq("uid", uid)
      .maybeSingle();
    if (!error && data) {
      return {
        uid,
        name: uid.slice(0, 6),
        bio: null,
        rank: (data as any).rank ?? 0,
        xp: (data as any).xp ?? 0,
        creds: (data as any).creds ?? 0,
        hack_level: (data as any).hack_level ?? 0,
        sec_level: (data as any).sec_level ?? 0,
      };
    }
  } catch {}
  return null;
}

export function UserPeekModal({
  uid,
  open,
  onClose,
}: { uid: string | null; open: boolean; onClose: () => void }) {
  const [p, setP] = useState<PublicProfile | null>(null);
  useEffect(() => { if (open && uid) { fetchPublic(uid).then(setP); } }, [open, uid]);

  if (!open || !uid) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-[min(92vw,520px)]" onClick={(e) => e.stopPropagation()}>
        <NeonCard title={p ? `👤 ${p.name}` : "Loading…"} accent="cyan">
          {!p ? (
            <div className="p-4">Loading…</div>
          ) : (
            <div className="p-4 space-y-4">
              {p.bio && <div className="text-sm opacity-80">“{p.bio}”</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 bg-white/10">
                  <div className="text-xs opacity-70">XP ✨</div>
                  <div className="text-xl font-bold">{p.xp}</div>
                </div>
                <div className="rounded-lg p-3 bg-white/10">
                  <div className="text-xs opacity-70">Coins 🪙</div>
                  <div className="text-xl font-bold">{p.creds}</div>
                </div>
                <div className="rounded-lg p-3 bg-white/10">
                  <div className="text-xs opacity-70">Hacking 🗡️</div>
                  <NeonBar value={Math.min(100, (p.hack_level ?? 0))} />
                </div>
                <div className="rounded-lg p-3 bg-white/10">
                  <div className="text-xs opacity-70">Security 🛡️</div>
                  <NeonBar value={Math.min(100, (p.sec_level ?? 0))} />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-3 py-1 rounded-lg border border-white/30 hover:border-white/60" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </NeonCard>
      </div>
    </div>
  );
}

export default function UserPeekLink({ uid, label, onOpen }: { uid: string; label: React.ReactNode; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="text-cyan-300 hover:text-white underline decoration-dotted"
        onClick={() => { setOpen(true); onOpen?.(); }}>
        {label}
      </button>
      <UserPeekModal uid={uid} open={open} onClose={() => setOpen(false)} />
    </>
  );
}