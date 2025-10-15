/**
 * lib/supa.ts
 * Browser supabase client alias.
 * Exports default, named `supabase`, and compat `client`.
 */
import supabaseClient from "@/lib/supabaseClient.client";
const supabase = supabaseClient;
export default supabaseClient;
export { supabase, supabaseClient as client };

// compatibility alias used in some modules
export { supabase as supa };
