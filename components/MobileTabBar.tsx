'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { addRipple, RippleBox } from '@/components/ui/Ripple';

const TABS = [
  { href: '/',            label: 'Home',       icon: '🏠' },
  { href: '/activity',    label: 'Activity',   icon: '📰' },
  { href: '/tasks',       label: 'Tasks',      icon: '✅' },
  { href: '/leaderboard', label: 'Top',        icon: '🏆' },
  { href: '/shop',        label: 'Shop',       icon: '🛒' },
  { href: '/inventory',   label: 'Bag',        icon: '🎒' },
  { href: '/profile',     label: 'Me',         icon: '👤' },
];

export default function MobileTabBar() {
  const pathname = usePathname() || '/';
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    barRef.current?.animate(
      [{transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}],
      {duration:200, easing:'ease-out'}
    );
  }, [pathname]);

  return (
    <nav
      ref={barRef}
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 backdrop-blur-md bg-[var(--c-bg)]/80"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      aria-label="Bottom Navigation"
    >
      <ul className="grid grid-cols-5 gap-1 px-2 pt-2 pb-1">
        {TABS.slice(0,5).map(t => {
          const active = pathname === t.href;
          return (
            <li key={t.href} className="flex justify-center">
              <RippleBox
                className={`rounded-xl ${active ? 'shadow-[0_0_24px_rgba(130,255,172,.25)]' : ''}`}
                onClick={addRipple}
              >
                <Link
                  href={t.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] transition
                  ${active ? 'bg-[var(--c-primary)] text-black' : 'bg-[var(--c-card)]/70 hover:opacity-90 active:scale-95'}`}
                >
                  <span aria-hidden>{t.icon}</span>
                  <span>{t.label}</span>
                </Link>
              </RippleBox>
            </li>
          );
        })}
      </ul>

      <ul className="grid grid-cols-2 gap-1 px-2 pb-2">
        {TABS.slice(5).map(t => {
          const active = pathname === t.href;
          return (
            <li key={t.href} className="flex justify-center">
              <RippleBox className="w-full max-w-[220px] rounded-xl" onClick={addRipple}>
                <Link
                  href={t.href}
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-[11px] transition
                  ${active ? 'bg-[var(--c-primary)] text-black' : 'bg-[var(--c-card)]/70 hover:opacity-90 active:scale-95'}`}
                >
                  <span aria-hidden>{t.icon}</span>
                  <span>{t.label}</span>
                </Link>
              </RippleBox>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
