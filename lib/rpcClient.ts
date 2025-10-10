import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
if (!anon) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(url, anon);

/**
 * Call any Postgres function exposed via Supabase RPC.
 * Returns typed data or throws on error.
 */
export async function rpc<T = any>(fn: string, args?: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  if (error) {
    // Surface clean message for easy debugging
    throw new Error(error.message || `RPC ${fn} failed`);
  }
  return data as T;
}
