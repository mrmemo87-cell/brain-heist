// app/page.tsx
import Link from "next/link";
import NeonCard from "@/components/NeonCard";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold neon-text">Brain Heist</h1>
        <nav className="flex gap-3">
          <Link href="/activity" className="neon-btn">Activity</Link>
          <Link href="/leaderboard" className="neon-btn">Leaderboard</Link>
          <Link href="/profile" className="neon-btn">Profile</Link>
        </nav>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <NeonCard title="How to play" subtitle="Quick & fun" accent="cyan">
          <ul className="list-disc ml-5 space-y-2">
            <li>Complete study tasks to earn coins & XP.</li>
            <li>Buy items from the shop to buff your hacking/security.</li>
            <li>Hack other players in your batch — watch cooldowns!</li>
            <li>Personalize your profile & unlock neon frames.</li>
          </ul>
        </NeonCard>

        <NeonCard title="Design goals" subtitle="Make it addictive" accent="pink">
          <div className="space-y-2">
            <div className="muted">Target audience</div>
            <div>Teens who love competitive games — vivid neon, animations, and bite-sized rewards.</div>
          </div>
        </NeonCard>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <Link href="/neon-demo" className="neon-border p-4 rounded-lg text-center hover:neon-glow">
          <div className="text-xl font-bold neon-text">Neon Demo</div>
          <div className="muted mt-1">See components & glow</div>
        </Link>

        <Link href="/activity" className="neon-border p-4 rounded-lg text-center hover:neon-glow">
          <div className="text-xl font-bold neon-text">Activity</div>
          <div className="muted mt-1">Batch targets & live feed</div>
        </Link>

        <Link href="/leaderboard" className="neon-border p-4 rounded-lg text-center hover:neon-glow">
          <div className="text-xl font-bold neon-text">Leaderboard</div>
          <div className="muted mt-1">Top hackers & reactions</div>
        </Link>
      </section>

      <footer className="text-sm muted">Tip: open the Activity page and try a mock hack to see cooldowns + animations.</footer>
    </main>
  );
}
