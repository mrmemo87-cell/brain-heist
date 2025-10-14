"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supa";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const v = window.localStorage.getItem("email");
        if (v) setEmail(v);
      } catch {}
    }
  }, []);

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error && typeof window !== "undefined") {
      try { window.localStorage.setItem("email", email); } catch {}
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">Welcome back</h1>
      <input
        className="w-full border rounded px-3 py-2 text-black"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button onClick={signIn} className="mt-3 px-4 py-2 rounded bg-black text-white">Send magic link</button>
      <div className="mt-6 text-sm">
        <Link href="/" className="underline">Home</Link>
      </div>
    </main>
  );
}