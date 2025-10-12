"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supa";
import { useCountTween } from "@/lib/useCountTween";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/activity", label: "Activity" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/shop", label: "Shop" },
  { href: "/inventory", label: "Inventory" },
  { href: "/profile", label: "Profile" },
];

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <path fill="currentColor"
        d="M12 2l2.2 4.7L19 9l-4.8 2.2L12 16l-2.2-4.8L5 9l4.8-2.3L12 2zm6.5 10.5l1.2 2.4 2.3 1.1-2.3 1.1-1.2 2.4-1.1-2.4-2.4-1.1 2.4-1.1 1.1-2.4zM4.5 12.5l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9.9-1.9z"/>
    </svg>
  );
}
function CoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
      <ellipse cx="12" cy="7" rx="8" ry="4" fill="currentColor" />
      <path d="M4 7v7c0 2.2 3.6 4 8 4s8-1.8 8-4V7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 11c0 2.2 3.6 4 8 4s8-1.8 8-4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [xpRaw, setXpRaw] = useState(0);
  const [credsRaw, setCredsRaw] = useState(0);
  const xp = useCountTween(xpRaw, 450);
  const creds = useCountTween(credsRaw, 450);
  const chRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function ensureChannel(uid: string) {
    if (chRef.current) { try { await supabase.removeChannel(chRef.current); } catch {} }
    const ch = supabase
      .channel("users-stats")
      .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "users", filter: `uid=eq.${uid}` },
          (payload) => {
            const r: any = payload.new ?? {};
            setXpRaw(Number(r.xp ?? 0));
            setCredsRaw(Number(r.creds ?? 0));
            document.getElementById("stat-bump")
              ?.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}], {duration:300});
          })
      .subscribe();
    chRef.current = ch;
  }

  async function loadMe() {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    setAuthed(!!uid);
    if (!uid) {
      if (chRef.current) { try { await supabase.removeChannel(chRef.current); } catch {} chRef.current = null; }
      setXpRaw(0); setCredsRaw(0);
      return;
    }
    const { data } = await supabase.from("users").select("xp,creds").eq("uid", uid).maybeSingle();
    setXpRaw(Number((data as any)?.xp ?? 0));
    setCredsRaw(Number((data as any)?.creds ?? 0));
    await ensureChannel(uid);
  }

  useEffect(() => {
    void loadMe();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => { await loadMe(); });
    const onWake = () => { if (document.visibilityState === "visible") void loadMe(); };
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
      if (chRef.current) void supabase.removeChannel(chRef.current);
    };
  }, []);

  async function logout() { await supabase.auth.signOut(); }

  return (
    <header className="sticky top-0 z-40">
      <div className="backdrop-blur-sm bg-[var(--c-bg)]/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-wide">🟣 Brain Heist</Link>
          <nav className="hidden md:flex gap-2">
            {NAV.map(n=>{
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href}
                  className={`px-3 py-2 rounded-xl text-sm ${active ? "bg-[var(--c-primary)] text-black" : "bg-[var(--c-card)]/70 hover:opacity-90"}`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2" id="stat-bump">
            {authed ? (
              <>
                <div className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70 ring-1 ring-cyan-400/40
                                drop-shadow-[0_0_12px_rgba(34,211,238,.55)] text-cyan-200 flex items-center gap-1">
                  <SparkleIcon /> {xp}
                </div>
                <div className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70 ring-1 ring-amber-400/40
                                drop-shadow-[0_0_12px_rgba(251,191,36,.55)] text-amber-200 flex items-center gap-1">
                  <CoinIcon /> {creds}
                </div>
                <button onClick={logout} className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70 hover:opacity-90">Logout</button>
              </>
            ) : (
              <Link href="/login" className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70 hover:opacity-90">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
