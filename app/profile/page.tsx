// app/profile/page.tsx
import React from 'react';
import ProfilePanel from '@/components/ProfilePanel';
import Feed from '@/components/Feed';
import Shop from '@/components/Shop';
import Inventory from '@/components/Inventory';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <ProfilePanel />
          <Inventory />
          <Shop />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Live Feed</h2>
          <Feed limit={40} />
        </div>
      </div>
    </div>
  );
}
