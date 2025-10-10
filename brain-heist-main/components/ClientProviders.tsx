'use client';
import React from 'react';
import AudioProvider from './AudioProvider';
import AuthGuard from './AuthGuard';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <AuthGuard>{children}</AuthGuard>
    </AudioProvider>
  );
}
