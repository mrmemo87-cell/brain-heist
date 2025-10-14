"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

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
    <main className="max-w-md mx-auto px-4 py-16 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={prefs.music} onChange={e => setPrefs({ ...prefs, music: e.target.checked })}/>
        <span>Background music</span>
      </label>
    </main>
  );
}