import Link from 'next/link';
export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to Brain Heist</h1>
      <p className="text-sm text-slate-400">Persistent Bitefight-style gameplay. Progress is saved.</p>
      <div className="space-x-3">
        <Link className="px-4 py-2 bg-emerald-600 rounded" href="/login">Log in</Link>
        <Link className="px-4 py-2 bg-slate-800 rounded" href="/signup">Sign up</Link>
      </div>
      <p className="text-sm text-slate-400">QR tip: link to <code>/signup?batch=8A</code>, <code>8B</code>, or <code>8C</code>.</p>
    </div>
  );
}
