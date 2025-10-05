'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import HeaderStatus from '@/components/HeaderStatus';

export default function AppHeader() {
  const path = usePathname();
  const isActive = (href: string) =>
    path === href || (href !== '/' && path.startsWith(href));

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
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
    <header className="header-glass">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
            🧠 Brain Heist
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/tasks" label="Tasks" />
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/profile" label="Profile" />
          <NavLink href="/leaderboard" label="Leaderboard" />
          <NavLink href="/login" label="Login" />
        </nav>
        <div className="flex items-center gap-4">
          <HeaderStatus />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
