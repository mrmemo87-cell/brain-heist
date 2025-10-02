'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginClient() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) setErr(error.message);
    else r.replace('/tasks');
  };

  const signInWithGoogle = async () => {
    setErr(null);
    const redirectTo = `${window.location.origin}/tasks`; // where to land after auth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Log in</h1>

      <form onSubmit={doLogin} className="space-y-3">
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Password" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={loading} className="px-4 py-2 bg-emerald-600 rounded">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <div className="text-sm text-slate-400">or</div>

      <button onClick={signInWithGoogle} className="px-4 py-2 bg-white text-slate-900 rounded">
        Continue with Google
      </button>

      <p className="text-sm text-slate-400">No account? <a className="underline" href="/signup">Create one</a></p>
    </div>
  );
}
