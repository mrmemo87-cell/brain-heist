'use client';
import { supabase } from '@/lib/supabaseClient';
export default function LogoutButton() {
  const doLogout = async () => { await supabase.auth.signOut(); location.href = '/login'; };
  return <button onClick={doLogout} className="text-sm underline">Logout</button>;
}

