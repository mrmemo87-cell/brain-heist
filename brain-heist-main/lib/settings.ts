// lib/settings.ts
import { makeBHClient } from "./bhClient";

const bh = makeBHClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

let cache: Record<string, any> | null = null;

export async function getSettings(keys?: string[]) {
  if (cache && !keys) return cache;
  const rows = await bh.unwrap<{ key: string; value: any }[]>(
    bh.rpc.rpc_settings_get(keys ?? null)
  );
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  cache = { ...(cache ?? {}), ...map };
  return map;
}
