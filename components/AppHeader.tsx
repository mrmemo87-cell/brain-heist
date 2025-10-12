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

export default function AppHeader() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [xpRaw, setXpRaw] = useState(0);
  const [credsRaw, setCredsRaw] = useState(0);
  const xp = useCountTween(xpRaw, 450);
  const creds = useCountTween(credsRaw, 450);

  const chRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const uidRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  async function ensureChannel(uid: string) {
    if (uidRef.current === uid && chRef.current) return; // already set
    // tear down previous
    if (chRef.current) {
      try { await supabase.removeChannel(chRef.current); } catch {}
      chRef.current = null;
    }
    uidRef.current = uid;

    const ch = supabase
      .channel("users-stats") // single name is fine; filter limits events
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `uid=eq.${uid}` },
        (payload) => {
          const r: any = payload.new ?? {};
          setXpRaw(Number(r.xp ?? 0));
          setCredsRaw(Number(r.creds ?? 0));
          document.getElementById("stat-bump")
            ?.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 300 });
        }
      )
      .subscribe(); // no manual retry; client auto-reconnects

    chRef.current = ch;
  }

  async function loadMe(light = false) {
    if (loadingRef.current && light) return; // throttle light refreshes
    loadingRef.current = true;

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    setAuthed(!!uid);

    if (!uid) {
      if (chRef.current) { try { await supabase.removeChannel(chRef.current); } catch {} chRef.current = null; }
      uidRef.current = null;
      setXpRaw(0); setCredsRaw(0);
      loadingRef.current = false;
      return;
    }

    // one-off fetch
    const { data } = await supabase.from("users").select("xp,creds").eq("uid", uid).maybeSingle();
    setXpRaw(Number((data as any)?.xp ?? 0));
    setCredsRaw(Number((data as any)?.creds ?? 0));

    await ensureChannel(uid);
    loadingRef.current = false;
  }

  useEffect(() => {
    void loadMe();

    // auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async () => { await loadMe(); });

    // light refresh when page gains focus/visibility, but DO NOT recreate channel
    const onWake = () => { if (document.visibilityState === "visible") void loadMe(true); };
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);

    // instant local bumps from Tasks (so header feels snappy)
    const onDelta = (e: any) => {
      const dxp = Number(e?.detail?.xpDelta || 0);
      const dcr = Number(e?.detail?.credsDelta || 0);
      if (dxp || dcr) {
        setXpRaw(v => v + dxp);
        setCredsRaw(v => v + dcr);
        document.getElementById("stat-bump")
          ?.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 300 });
      }
    };
    window.addEventListener("stats:delta", onDelta);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("stats:delta", onDelta);
      if (chRef.current) void supabase.removeChannel(chRef.current);
      chRef.current = null;
      uidRef.current = null;
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
                <div className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70">✨ {xp}</div>
                <div className="px-3 py-2 rounded-xl text-sm bg-[var(--c-card)]/70">💰 {creds}</div>
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
