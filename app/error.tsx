'use client';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="rounded-2xl p-4 bg-black/40 border border-white/10">
        <div className="mb-2 font-semibold">Something went wrong</div>
        <button onClick={() => reset()} className="px-3 py-2 rounded-xl bg-[var(--c-primary)]/80">Try again</button>
      </div>
    </div>
  );
}

