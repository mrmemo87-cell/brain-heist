export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="max-w-3xl mx-auto p-4">
          <header className="flex items-center justify-between py-3">
            <a href="/" className="font-semibold">🧠 Brain Heist</a>
            <nav className="text-sm space-x-4">
              <a href="/tasks" className="hover:underline">Tasks</a>
              <a href="/shop" className="hover:underline">Shop</a>
              <a href="/profile" className="hover:underline">Profile</a>
              <a href="/leaderboard" className="hover:underline">Leaderboard</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
