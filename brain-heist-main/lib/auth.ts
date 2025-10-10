import { SupabaseClient } from '@supabase/supabase-js';
export async function getUid(supabase: SupabaseClient, waitMs = 6000): Promise<string> {
  let { data } = await supabase.auth.getSession();
  let uid = data.session?.user?.id ?? null;
  const start = Date.now();
  while (!uid && Date.now() - start < waitMs) {
    await new Promise(res => setTimeout(res, 120));
    ({ data } = await supabase.auth.getSession());
    uid = data.session?.user?.id ?? null;
  }
  if (!uid) throw new Error('Not logged in');
  return uid;
}
