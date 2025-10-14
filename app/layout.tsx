import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Brain Heist" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-grid text-[var(--c-text)]">
        <header className="bh-header">
          <div className="bh-shell">
            <div className="bh-logo">🧠 Brain Heist</div>
            <nav className="bh-nav">
              <Link href="/">Home</Link>
              <Link href="/activity">Activity</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/tasks">Tasks</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/inventory">Inventory</Link>
              <Link href="/profile">Profile</Link>
            </nav>
          </div>
        </header>
        <main className="bh-main">
          <div className="bh-shell">{children}</div>
        </main>
      </body>
    </html>
  );
}