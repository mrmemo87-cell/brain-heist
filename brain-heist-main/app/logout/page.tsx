'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Logout() {
  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      try { await sb.auth.signOut(); } catch {}
      window.location.href = '/login';
    })();
  }, []);
  return <div className="card p-4">Signing out…</div>;
}
