export function parseOptions(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  const s = String(raw).trim();
  try {
    if (s.startsWith("[")) {
      const arr = JSON.parse(s);
      return (Array.isArray(arr) ? arr : []).map((x) => String(x));
    }
  } catch {}
  const inner = s.replace(/^[{\[]|[}\]]$/g, "");
  return inner.split(",").map((t) => t.replace(/^["']|["']$/g, "").trim()).filter(Boolean);
}
export function toInt(v: unknown, d = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}
