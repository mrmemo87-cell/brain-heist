import './globals.css';
import React from 'react';
import AppHeader from '@/components/AppHeader';
import AuthGuard from '@/components/AuthGuard';
import MobileTabBar from '@/components/MobileTabBar';

export const metadata = {
  title: 'Brain Heist',
  description: 'Classroom hacking game',
  icons: { icon: '/favicon.ico' },
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-grid min-h-screen bg-[var(--c-bg)] text-white">
        <AuthGuard>
          <AppHeader />
          <main className="max-w-6xl mx-auto px-4 pt-4 pb-28 md:pb-6">{children}</main>
          <MobileTabBar />
        </AuthGuard>
      </body>
    </html>
  );
}


