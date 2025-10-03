import './globals.css';

export const metadata = { title: 'Brain Heist', description: 'Persistent world game' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
