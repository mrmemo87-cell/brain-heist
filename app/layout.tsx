import './globals.css';
import AppHeader from '@/components/AppHeader';
import { ToastProvider } from '@/components/ui/toast';

export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-game">
        <ToastProvider>
          <AppHeader />
          <main className="container py-6">{children}</main>
          <footer className="container py-10 text-center">
  <div className="inline-block text-sm px-3 py-1 rounded-xl border border-ink-800 bg-ink-900/60 relative overflow-hidden">
    <span className="relative z-10">
      (Season 1) runs 1-Nov-2025 → 31-May-2026 · Top 3 win prizes from Mr. Sobbi
    </span>
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_infinite]"></span>
  </div>
</footer>
        </ToastProvider>
      </body>
    </html>
  );
}
