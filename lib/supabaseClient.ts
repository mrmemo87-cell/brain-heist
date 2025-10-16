/**
 * lib/supabaseClient.ts
 * Minimal compatibility alias that re-exports the browser client and provides a named `supabase` export.
 * If you keep a server/client split, replace this with your preferred server client file.
 */
import client from "@/lib/supabaseClient.client";

const supabase = client;

// default export (common import style)
// named export `supabase` so code that does `import { supabase } from "@/lib/supabaseClient"` works
export default client;
export { supabase, client as supabaseClient };