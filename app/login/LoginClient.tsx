'use client';

import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supa';
import { addRipple, RippleBox } from '@/components/ui/Ripple';

export default function LoginClient() {
  const supa = supabase;
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      window.location.href = '/';
    } catch (ex: any) {
      setErr(ex?.message ?? 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}
      className="bg-[var(--c-card)]/60 border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(130,255,172,.08)] backdrop-blur">
      <label className="block text-sm mb-1">Email</label>
      <input
        type="email" inputMode="email" autoComplete="email" required
        value={email} onChange={e=>setEmail(e.target.value)}
        className="bh-input mb-3" placeholder="you@bh.com"
      />

      <label className="block text-sm mb-1">Password</label>
      <input
        type="password" autoComplete="current-password" required
        value={pass} onChange={e=>setPass(e.target.value)}
        className="bh-input mb-4" placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
        onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); void onSubmit(); } }}
      />

      {err && <div className="text-[13px] text-red-300/90 mb-3">{err}</div>}

      <RippleBox onClick={addRipple} className="rounded-xl">
        <button
          type="submit" disabled={busy}
          className={`w-full bh-btn ${busy ? 'opacity-70 cursor-wait' : ''}`}
        >
          {busy ? 'Signing inвЂ¦' : 'Sign in'}
        </button>
      </RippleBox>

      <div className="mt-3 text-xs opacity-75 text-center">
        Students: use the email + password given by your teacher.
      </div>
    </form>
  );
}

