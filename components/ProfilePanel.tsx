// components/ProfilePanel.tsx
import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient.client';
import { rpcActiveEffectsForMe } from '@/lib/api';

export default function ProfilePanel() {
  const [user, setUser] = useState<any | null>(null);
  const [effects, setEffects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const s = await supabase.auth.getSession();
      const session = (s as any)?.data?.session ?? null;
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: u, error } = await supabase.from('users').select('*').eq('uid', session.user.id).single();
      if (error) {
        console.error('fetch user', error);
      } else if (mounted) {
        setUser(u);
      }

      try {
        const eff = await rpcActiveEffectsForMe();
        if (mounted) setEffects(eff ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-4">Loading profile…</div>;
  if (!user) return <div className="p-4">Not signed in</div>;

  return (
    <div className="p-4 rounded-lg shadow bg-[rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-4">
        <img src={user.avatar_url ?? '/avatar-placeholder.png'} alt="avatar" className="w-14 h-14 rounded-full" />
        <div>
          <div className="text-lg font-semibold text-white">{user.uid}</div>
          <div className="text-sm text-gray-300">Rank: {user.rank_badge ?? 'Unknown'}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-sm text-gray-300">Coins</div>
          <div className="text-lg font-bold">{user.coins ?? 0}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-300">XP</div>
          <div className="text-lg font-bold">{user.xp ?? 0}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-300">Stamina</div>
          <div className="text-lg font-bold">{user.stamina_current ?? 0}/{user.stamina_max ?? 0}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-300">Active Effects</div>
        <div className="flex gap-2 mt-2">
          {effects.length === 0 ? (
            <div className="text-xs text-gray-400">None</div>
          ) : (
            effects.map((e:any) => (
              <div key={e.id} className="px-2 py-1 rounded bg-[rgba(255,255,255,0.02)] text-xs">
                {e.meta?.name ?? e.id}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
