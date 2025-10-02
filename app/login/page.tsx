'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Login() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-sm text-slate-400">Build test: page renders at runtime.</p>
    </div>
  );
}
