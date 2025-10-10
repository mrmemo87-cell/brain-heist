'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [me,setMe] = useState<{ email?:string }|null>(null);
  const [target,setTarget]=useState(''); // user_id (uuid) or username you’ll paste
  const [msg,setMsg]=useState<string|undefined>();

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.auth.getUser();
    setMe({ email: data.user?.email });
  })(); },[]);

  const isAdmin = !!me?.email && me.email.endsWith('@YOURDOMAIN.com'); // <-- change this rule

  const grant = async() => {
    setMsg(undefined);
    try {
      // Example: give 200 coins to target user_id
      await supabase.rpc('rpc_admin_grant_coins', { _user: target, _coins: 200 });
      setMsg('Granted 200 coins ✅');
    } catch(e:any){ setMsg(e.message); }
  };

  const ban = async() => {
    setMsg(undefined);
    try {
      await supabase.rpc('rpc_admin_ban', { _user: target });
      setMsg('User banned ✅');
    } catch(e:any){ setMsg(e.message); }
  };

  if (!isAdmin) return <AuthGate><div className="p-6">Admins only</div></AuthGate>;

  return (
    <AuthGate>
      <h1 className="text-xl font-semibold mb-4">Mr. Sobbi — Admin</h1>
      <div className="space-y-3">
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="target user_id (uuid)" value={target} onChange={e=>setTarget(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-emerald-600 rounded" onClick={grant}>Grant 200 coins</button>
          <button className="px-3 py-1 bg-red-600 rounded" onClick={ban}>Ban user</button>
        </div>
        {msg && <div className="text-sm text-emerald-400">{msg}</div>}
      </div>
    </AuthGate>
  );
}
