'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import HeaderStatus from '@/components/HeaderStatus';

export default function AppHeader() {
  const path = usePathname();
  const isActive = (href: string) =>
    path === href || (href !== '/' && path.startsWith(href));

  const a = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={[
        'px-3 py-1.5 rounded-lg text-sm',
        isActive(href) ? 'bg-ink-800 text-white' : 'text-ink-200 hover:text-white'
      ].join(' ')}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-ink-900 bg-ink-950/60 backdrop-blur supports-[backdrop-filter]:bg-ink-950/40">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">🧠 Brain Heist</Link>
        <nav className="flex items-center gap-1">
          {a('/tasks','Tasks')}
          {a('/shop','Shop')}
          {a('/profile','Profile')}
          {a('/leaderboard','Leaderboard')}
          {a('/login','Login')}
        </nav>
        <div className="flex items-center gap-4">
          <HeaderStatus />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
