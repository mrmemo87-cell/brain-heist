"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supa";
import Link from "next/link";
import NeonAvatar from "@/components/NeonAvatar";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = window.localStorage.getItem("email");
      if (v) setEmail(v);
    } catch {}
  }, []);

  function rememberEmail(v: string) {
    setEmail(v);
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem("email", v); } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setOk(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        setOk("Signed in. Redirecting…");
      } else {
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) throw error;
        setOk("Account created! Check your inbox to confirm, then sign in.");
        setMode("signin");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] relative overflow-hidden bg-[var(--c-bg)] text-white">
      {/* animated backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="neon-grid" />
        <div className="scanlines" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(0,255,255,.12),transparent),radial-gradient(900px_500px_at_110%_110%,rgba(255,0,170,.12),transparent)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14 grid md:grid-cols-[1.1fr_.9fr] gap-10">
        {/* Left: Form */}
        <div>
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight neon-title">
              <span className="text-cyan-300">Brain</span> <span className="text-fuchsia-300">Heist</span>
            </h1>
            <p className="mt-2 text-sm opacity-80">Welcome back, netrunner. Authenticate to jack in.</p>
          </header>

          <form onSubmit={onSubmit} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{mode === "signin" ? "Sign in" : "Create account"}</h2>
              <button
                type="button"
                onClick={() => setMode(m => (m === "signin" ? "signup" : "signin"))}
                className="h-btn h-btn--ghost"
              >
                {mode === "signin" ? "Need an account?" : "Have an account?"}
              </button>
            </div>

            <label className="block">
              <span className="text-xs opacity-80">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => rememberEmail(e.target.value)}
                className="h-input"
                placeholder="you@school.edu"
              />
            </label>

            <label className="block">
              <span className="text-xs opacity-80">Password</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-input pr-16"
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 rounded-md text-xs bg-white/10 hover:bg-white/20 border border-white/15"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {err && <div className="alert error">{err}</div>}
            {ok &&  <div className="alert ok">{ok}</div>}

            <button disabled={busy} className="h-btn w-full">
              {busy ? "Processing…" : (mode === "signin" ? "Jack in" : "Create account")}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 opacity-80">
              <Link href="/" className="underline">← Back home</Link>
              <span className="font-mono">Mode: {mode}</span>
            </div>
          </form>
        </div>

        {/* Right: 3D neon avatar */}
        <div className="grid place-items-center">
          <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
            <NeonAvatar />
          </div>
          <p className="mt-3 text-xs opacity-80 text-center">Your avatar glows harder the closer you are to the mainframe.</p>
        </div>
      </div>
    </main>
  );
}