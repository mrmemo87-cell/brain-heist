"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  // Any value that comes from localStorage must be read in useEffect
  const [rememberedEmail, setRememberedEmail] = useState<string>("");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const v = window.localStorage.getItem("email") || "";
        setRememberedEmail(v);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>

      <form className="space-y-3">
        <label className="block text-sm">Email</label>
        <input
          className="w-full rounded-md border border-black/10 px-3 py-2 text-black"
          defaultValue={rememberedEmail}
          placeholder="you@example.com"
          type="email"
          name="email"
        />

        <label className="block text-sm">Password</label>
        <input
          className="w-full rounded-md border border-black/10 px-3 py-2 text-black"
          placeholder="••••••••"
          type="password"
          name="password"
        />

        <button
          type="submit"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/30 hover:bg-white/15"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-sm opacity-70">
        No account? <Link className="underline" href="/signup">Create one</Link>
      </p>
    </main>
  );
}