'use client';

// components/AppBoot.tsx
import { useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supa';

export default function AppBoot() {
  const supa = supabase;

  useEffect(() => {
    (async () => {
      try { await supabase.rpc('rpc_session_start'); } catch {}
      try { await supabase.rpc('rpc_touch_online'); } catch {}
    })();
  }, [supabase]);

  return null;
}
