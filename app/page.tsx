<<<<<<< HEAD
C:\dev\brain-heist
=======
"use client";
import Link from "next/link";

function Announcement() {
  return (
    <div className="rounded-2xl border border-emerald-300/50 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-[0_0_30px_#34d39933]">
      <p className="font-semibold">Season info</p>
      <p className="text-sm mt-1">
        This game runs from <strong>November</strong> till <strong>May</strong>.
        Rewards by <strong>Mr. Sobbi</strong> for the highest <strong>3 players</strong> in the ranking from each batch.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">🟣 Brain Heist</h1>

      <Announcement />

      <section className="rounded-2xl border border-black/10 bg-white shadow-[0_5px_30px_rgba(0,0,0,0.06)]">
        <div className="p-4 text-sm text-gray-700 leading-relaxed">
          <p className="mb-3">
            Tip: if your stats don’t update instantly, just refresh the page.
            We’re improving live updates so you won’t need to do that for long. 💪
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tasks"
              className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white hover:opacity-90 active:scale-[0.99] transition"
            >
              ▶ Play Tasks
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center rounded-xl px-4 py-2 bg-fuchsia-600 text-white hover:opacity-90 active:scale-[0.99] transition"
            >
              🏆 Leaderboard
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl px-4 py-2 bg-amber-500 text-black hover:opacity-90 active:scale-[0.99] transition"
            >
              🛍️ Shop
            </Link>
            <Link
              href="/inventory"
              className="inline-flex items-center rounded-xl px-4 py-2 bg-sky-500 text-white hover:opacity-90 active:scale-[0.99] transition"
            >
              🎒 Inventory
            </Link>
            <Link
              href="/activity"
              className="inline-flex items-center rounded-xl px-4 py-2 bg-emerald-500 text-white hover:opacity-90 active:scale-[0.99] transition"
            >
              📣 Activity
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
>>>>>>> f670800 (home: season notice + quick links + light card styling)
