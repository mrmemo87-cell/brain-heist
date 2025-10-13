'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supa';

const PUBLIC = new Set<string>(['/','/login','/signup','/debug/whoami']);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const has = !!data.session;
      if (!mounted) return;

      setAuthed(has);
      setReady(true);

      if (has) {
        setTimeout(async () => {
          await supabase.rpc('rpc_touch_online');
        }, 0);
      } else if (!PUBLIC.has(pathname)) {
        router.replace('/login');
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((evt, sess) => {
        if (!mounted) return;
        if (evt === 'SIGNED_IN' && sess) {
          setAuthed(true);
          setTimeout(async () => {
            await supabase.rpc('rpc_touch_online');
          }, 0);
          if (pathname === '/login' || pathname === '/signup') router.replace('/');
        }
        if (evt === 'SIGNED_OUT') {
          setAuthed(false);
          if (!PUBLIC.has(pathname)) router.replace('/login');
        }
      });

      const onWake = async () => {
        const { data } = await supabase.auth.getSession();
        const hasNow = !!data.session;
        setAuthed(hasNow);
        if (hasNow) await supabase.rpc('rpc_touch_online');
        else if (!PUBLIC.has(pathname)) router.replace('/login');
      };
      window.addEventListener('focus', onWake);
      document.addEventListener('visibilitychange', onWake);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('focus', onWake);
        document.removeEventListener('visibilitychange', onWake);
      };
    })();

    return () => { mounted = false; };
  }, [pathname, router]);

  if (!ready) {
    return <div className="fixed inset-0 grid place-items-center">
      <div className="animate-pulse opacity-70 text-sm">LoadingвЂ¦</div>
    </div>;
  }

  if (authed === false && !PUBLIC.has(pathname)) return null;
  return <>{children}</>;
}


