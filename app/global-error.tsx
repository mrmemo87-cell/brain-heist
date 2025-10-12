'use client';
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html><body>
      <div className="min-h-screen grid place-items-center">
        <div className="rounded-2xl p-4 bg-black/40 border border-white/10">
          <div className="mb-2 font-semibold">App crashed</div>
          <button onClick={() => reset()} className="px-3 py-2 rounded-xl bg-[var(--c-primary)]/80">Reload</button>
        </div>
      </div>
    </body></html>
  );
}

