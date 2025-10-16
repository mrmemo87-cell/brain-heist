// lib/supabaseClient.client.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anon) {
  // Keep this silent in runtime, but devs will notice missing envs during build/dev.
  console.warn('Supabase env vars are not set: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(url, anon, {
  auth: {
    // use redirects in your app code
  }
});

export default supabase;
