'use client';
export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Signup() {
  const r = useRouter(); const qp = useSearchParams();
  const [email,setEmail]=useState(''); const [pass,setPass]=useState('');
  const [username,setUsername]=useState('');
  const [batch,setBatch]=useState(qp.get('batch') ?? '8A');
  const [err,setErr]=useState<string|undefined>();

  useEffect(()=>{ const b=qp.get('batch'); if(b) setBatch(b); },[qp]);

  const go = async (e:any) => {
    e.preventDefault(); setErr(undefined);
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return setErr(error.message);
    try {
      await supabase.rpc('rpc_register', { _batch: batch, _username: username, _avatar_url: null });
    } catch (e:any){ setErr(e.message); }
    r.replace('/tasks');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <form onSubmit={go} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {['8A','8B','8C'].map(b => (
            <button key={b} type="button"
              onClick={()=>setBatch(b)}
              className={`p-2 rounded ${batch===b?'bg-emerald-600':'bg-slate-800'}`}>{b}</button>
          ))}
        </div>
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 p-2 rounded" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="px-4 py-2 bg-emerald-600 rounded">Sign up</button>
      </form>
      <p className="text-sm text-slate-400">Have an account? <a className="underline" href="/login">Log in</a></p>
    </div>
  );
}
