export default function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className="progress">
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
