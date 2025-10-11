'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SFX } from '@/lib/sfx';

export default function Home() {
  const r = useRouter();

  useEffect(() => {
    // start background music (no arg) and go to profile
    SFX.bg();
    r.replace('/profile');
  }, [r]);

  return null;
}
<div className="p-2 text-xs">build: test-deploy</div