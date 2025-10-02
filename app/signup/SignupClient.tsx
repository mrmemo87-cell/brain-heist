'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignupClient() {
  const r = useRouter();
  const qp = useSearchParams();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [username, setUsername] = useState('');
  const [batch, setBatch] = useState<'8A' | '8B' | '8C'>('8A');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const b = qp.get('batch');
    if (b === '8A' || b === '8B' || b === '8C') setBatch(b);
  }, [qp]);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) {
      setLoading(false);
      return setErr(error.message);
    }
    try {
      // Initializes profile & locks batch (must exist in DB)
      await supabase.rpc('rpc_register', {
        _batch: batch,
        _username: username,
        _avatar_url: null
      });
    } catch (e: any) {
      setErr(e.message ?? 'Registration RPC failed');
    }
    setLoading(false);
    r.replace('/tasks');
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <form onSubmit={go} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(['8A','8B','8C'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBatch(b)}
              className={`p-2 rounded ${batch === b ? 'bg-emerald-600' : 'bg-slate-800'}`}
            >
              {b}
            </button>
          ))}
        </div>
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Password" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={loading} className="px-4 py-2 bg-emerald-600 rounded">{loading ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="text-sm text-slate-400">Have an account? <a className="underline" href="/login">Log in</a></p>
    </div>
  );
}
