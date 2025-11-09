"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<{ music:boolean } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("prefs");
        setPrefs(raw ? JSON.parse(raw) : { music: true });
      } catch {
        setPrefs({ music: true });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && prefs) {
      try { window.localStorage.setItem("prefs", JSON.stringify(prefs)); } catch {}
    }
  }, [prefs]);

  if (!prefs) return <main className="max-w-md mx-auto px-4 py-16">Loading…</main>;

  return (
    <main className="max-w-md mx-auto px-4 py-16 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <section className="space-y-4">
        <h2 className="text-lg font-semibold opacity-80">Preferences</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={prefs.music} onChange={e => setPrefs({ ...prefs, music: e.target.checked })}/>
          <span>Background music</span>
        </label>
      </section>

      <section className="space-y-4 pt-4 border-t border-white/10">
        <h2 className="text-lg font-semibold opacity-80">Account</h2>
        <Link 
          href="/logout" 
          className="inline-block px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition"
        >
          Log out
        </Link>
      </section>
    </main>
  );
}