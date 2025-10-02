'use client';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const r = useRouter();
  const [email,setEmail]=useState(''); const [pass,setPass]=useState('');
  const [err,setErr]=useState<string|undefined>();

  const doLogin = async (e:any) => {
    e.preventDefault();
    setErr(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setErr(error.message);
    else r.replace('/tasks');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Log in</h1>
      <form onSubmit={doLogin} className="space-y-3">
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="px-4 py-2 bg-emerald-600 rounded">Sign in</button>
      </form>
      <p className="text-sm text-slate-400">No account? <a className="underline" href="/signup">Create one</a></p>
    </div>
  );
}
