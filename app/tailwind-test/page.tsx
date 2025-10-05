export const dynamic = 'force-dynamic';
export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <div className="p-4 rounded-xl bg-emerald-600">tailwind is WORKING ✅</div>
      <div className="p-4 rounded-xl bg-ink-900 text-ink-100 shadow-soft border border-ink-800">
        custom ink palette + shadow
      </div>
    </div>
  );
}
