import './globals.css';
import AppHeader from '@/components/AppHeader';

export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <body className="bg-game">
        <AppHeader />
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-center text-sm text-ink-400">
          Season runs Oct → May · Top 3 win prizes from Mr. Sobbi
        </footer>
      </body>
    </html>
  );
}
