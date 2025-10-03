import './globals.css';
import Link from 'next/link';

// ✅ import client components directly (no dynamic)
import LogoutButton from '@/components/LogoutButton';
import HeaderStatus from '@/components/HeaderStatus';

export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink-900 bg-ink-950/60 backdrop-blur supports-[backdrop-filter]:bg-ink-950/40">
          <div className="container py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">🧠 Brain Heist</Link>
            <nav className="flex items-center gap-1">
              <Link href="/tasks" className="px-3 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white">Tasks</Link>
              <Link href="/shop" className="px-3 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white">Shop</Link>
              <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white">Profile</Link>
              <Link href="/leaderboard" className="px-3 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white">Leaderboard</Link>
              <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white">Login</Link>
            </nav>
            <div className="flex items-center gap-4">
              <HeaderStatus />
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="container py-6">{children}</main>

        <footer className="container py-10 text-center text-sm text-ink-400">
          Season runs Oct → May · Top 3 win prizes from Mr. Sobbi
        </footer>
      </body>
    </html>
  );
}
