import './globals.css';
import '@fontsource/noto-color-emoji'; // emoji font for consistency
import ClientProviders from '@/components/ClientProviders';
import TopBar from '@/components/TopBar';
import MobileTabBar from '@/components/MobileTabBar';

export const metadata = {
  title: 'Brain Heist',
  description: 'Hacker vibes, neon leaderboard, learn & play',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <TopBar />
          {children}
          <MobileTabBar />
        </ClientProviders>
      </body>
    </html>
  );
}
