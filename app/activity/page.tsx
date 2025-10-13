'use client';

import React from 'react';
import TargetsList from '@/components/TargetsList';
import HackFeed from '@/components/HackFeed';

export default function ActivityPage() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Activity</h1>
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-4 bg-[var(--c-surface)]/80 space-y-3">
            <h2 className="text-lg font-semibold">Targets (Your Batch)</h2>
            <TargetsList />
          </div>
        </div>
        <aside className="space-y-2">
          <h2 className="text-lg font-semibold">Live Feed</h2>
          <HackFeed limit={30} />
        </aside>
      </section>
    </main>
  );
}

