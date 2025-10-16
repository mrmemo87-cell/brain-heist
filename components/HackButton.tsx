// components/HackButton.tsx
import React, { useState } from 'react';
import { rpcHackAttempt, rpcHackEmulate } from '@/lib/api';

export default function HackButton({ target }: { target: string }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any|null>(null);
  const [result, setResult] = useState<any|null>(null);
  const [err, setErr] = useState<string|null>(null);

  async function previewHack() {
    setErr(null);
    try {
      const p = await rpcHackEmulate(target);
      setPreview(p);
    } catch (e:any) {
      setErr(e.message || String(e));
    }
  }

  async function doHack() {
    setErr(null);
    setLoading(true);
    try {
      const r = await rpcHackAttempt(target);
      setResult(r);
      // refresh UI (profile/feed) via events or re-fetch in parent
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={previewHack}
        className="px-3 py-2 rounded bg-[linear-gradient(90deg,#00F0FF,#FF3DFF)] text-black text-sm"
      >
        Preview Chance
      </button>

      {preview && (
        <div className="text-xs text-gray-200">
          Chance: {(preview.win_prob * 100).toFixed(1)}% — simulated outcome: <b>{preview.outcome}</b>
        </div>
      )}

      <button
        onClick={doHack}
        disabled={loading}
        className="mt-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 text-white font-bold shadow"
      >
        {loading ? 'Hacking…' : 'Hack!'}
      </button>

      {result && (
        <div className="mt-2 text-sm text-white">
          Result: <b>{result.result}</b> — stolen: {result.coins_stolen ?? 0}
        </div>
      )}

      {err && <div className="text-xs text-red-300">{err}</div>}
    </div>
  );
}
