'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace('/login');
      } else {
        setReady(true);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.replace('/login');
        else setReady(true);
      });
      unsub = () => listener.subscription.unsubscribe();
    })();

    return () => { if (unsub) unsub(); };
  }, [router]);

  if (!ready) return <div className="p-6">Loading…</div>;
  return <>{children}</>;
}
