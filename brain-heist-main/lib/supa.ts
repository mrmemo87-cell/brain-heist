// /lib/supa.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _sb: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_sb) return _sb;
  _sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // custom key so old clients (if any) don't clash
        storageKey: 'bh-auth',
      },
      realtime: { params: { eventsPerSecond: 2 } },
    }
  );
  return _sb;
}

// convenience default export
export const supabase = getSupabase();
