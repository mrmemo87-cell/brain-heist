import './globals.css';
import '@fontsource/noto-color-emoji'; // emoji font for consistency

export const metadata = {
  title: 'Brain Heist',
  description: 'Hacker vibes, neon leaderboard, learn & play',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
