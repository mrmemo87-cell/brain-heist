'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignupClient() {
  const router = useRouter();
  const qp = useSearchParams();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [username, setUsername] = useState('');
  const [batch, setBatch] = useState<'8A' | '8B' | '8C'>('8A');

  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Read ?batch= from URL (optional)
  useEffect(() => {
    const b = qp.get('batch');
    if (b === '8A' || b === '8B' || b === '8C') setBatch(b);
  }, [qp]);

  const signUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    // Try to register profile; if you’re assigning batches later, this can fail silently
    try {
      await supabase.rpc('rpc_register', {
        _batch: batch,
        _username: username || email.split('@')[0], // fallback username
        _avatar_url: null
      });
      setInfo('Account created. Profile initialized.');
    } catch (e: any) {
      // Don’t block signup if rpc_register isn’t ready
      setInfo('Account created. Profile setup will be completed later.');
    }

    setLoading(false);
    router.replace('/tasks');
  };

  const signInWithGoogle = async () => {
    setErr(null);
    setInfo(null);
    // After Google returns, we’ll land on /tasks; you can complete profile there if needed
    const redirectTo = `${window.location.origin}/tasks`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Create your account</h1>

      <form onSubmit={signUpWithEmail} className="space-y-3">
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

        <input
          className="w-full bg-slate-900 p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />
        <input
          className="w-full bg-slate-900 p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="w-full bg-slate-900 p-2 rounded"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e)=>setPass(e.target.value)}
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}
        {info && <p className="text-emerald-400 text-sm">{info}</p>}

        <button disabled={loading} className="px-4 py-2 bg-emerald-600 rounded">
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <div className="text-sm text-slate-400">or</div>

      <button onClick={signInWithGoogle} className="px-4 py-2 bg-white text-slate-900 rounded">
        Continue with Google
      </button>

      <p className="text-sm text-slate-400">
        Have an account? <a className="underline" href="/login">Log in</a>
      </p>
    </div>
  );
}
