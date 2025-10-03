import './globals.css';
import Link from 'next/link';
import { headers } from 'next/headers';
import dynamic from 'next/dynamic';

const LogoutButton = dynamic(() => import('@/components/LogoutButton'), { ssr: false });
const HeaderStatus = dynamic(() => import('@/components/HeaderStatus'), { ssr: false });

export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

function NavLink({ href, label }: { href: string; label: string }) {
  // Quick active check based on current path prefix
  // (This is a server component; headers() is allowed)
  const h = headers();
  const path = h.get('x-pathname') || ''; // Vercel sets this; fallback to ''
  const active = path === href || (href !== '/' && path.startsWith(href));
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-lg text-sm ${active ? 'bg-ink-800 text-white' : 'text-ink-200 hover:text-white'}`}>
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink-900 bg-ink-950/60 backdrop-blur supports-[backdrop-filter]:bg-ink-950/40">
          <div className="container py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">🧠 Brain Heist</Link>
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

        <main className="container py-6">
          {children}
        </main>

        <footer className="container py-10 text-center text-sm text-ink-400">
          Season runs Oct → May · Top 3 win prizes from Mr. Sobbi
        </footer>
      </body>
    </html>
  );
}
