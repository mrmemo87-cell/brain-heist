'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';

export default function TasksPage() {
  return (
    <AuthGate>
      <div className="p-4 space-y-2">
        <h1 className="h1">Tasks</h1>
        <p className="subtle">Tasks page placeholder.</p>
      </div>
    </AuthGate>
  );
}
