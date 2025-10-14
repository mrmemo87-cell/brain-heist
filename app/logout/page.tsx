"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supa";

export default function LogoutPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // sign out (ignore errors)
        await supabase.auth.signOut();
      } catch {}
      try {
        if (typeof window !== "undefined") {
          // only touch localStorage in the browser
          window.localStorage.removeItem("email");
          window.localStorage.removeItem("bio");
          // …remove any other app keys here
        }
      } catch {}
      setDone(true);
    })();
  }, []);

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-3">Logging out…</h1>
      <p className="opacity-80">
        {done ? "You’ve been signed out." : "Finishing up your session…"}
      </p>
      <div className="mt-6">
        <Link href="/login" className="underline">Back to login</Link>
      </div>
    </main>
  );
}