"use client";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">🧠 Brain Heist</h1>
      <p>
        This game runs from <b>November</b> till <b>May</b>.
        Rewards by <b>Mr. Sobbi</b> for the highest 3 players in the ranking from each batch.
      </p>
      <p className="text-sm opacity-70">
        Tip: if your stats stop moving, refresh to resync your session.
      </p>
    </main>
  );
}