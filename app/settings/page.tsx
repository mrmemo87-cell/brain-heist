'use client';
import { useEffect, useState } from 'react';

const THEMES = [
  { id:'cyber', name:'Cyber Neon' },
  { id:'forest', name:'Forest Mint' },
  { id:'rose', name:'Rose Blaze' },
];

export default function Settings() {
  const [theme,setTheme]=useState('cyber');
  const [music,setMusic]=useState(0.4);
  const [sfx,setSfx]=useState(true);

  useEffect(()=>{
    const p = JSON.parse(localStorage.getItem('bh_prefs') ?? '{}');
    setTheme(p.theme ?? 'cyber'); setMusic(p.music ?? 0.4); setSfx(p.sfx ?? true);
  },[]);
  useEffect(()=>{
    localStorage.setItem('bh_prefs', JSON.stringify({theme,music,sfx}));
    document.documentElement.dataset.theme = theme; // apply theme data attr
  },[theme,music,sfx]);

  return (
    <div className="space-y-6">
      <h1 className="h1">Settings</h1>

      <div className="card p-4">
        <div className="font-semibold mb-2">Theme</div>
        <div className="flex gap-2">
          {THEMES.map(t=>(
            <button key={t.id} onClick={()=>setTheme(t.id)} className={`btn ${theme===t.id?'btn-primary':'btn-ghost'}`}>{t.name}</button>
          ))}
        </div>
        <div className="text-sm text-ink-400 mt-2">More themes coming — neon cyberpunk, vaporwave, hacker grid.</div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-2">Audio</div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Background music</label>
          <input type="range" min={0} max={1} step={0.01} value={music} onChange={e=>setMusic(parseFloat(e.target.value))} />
          <span className="text-sm text-ink-300">{Math.round(music*100)}%</span>
        </div>
        <div className="mt-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sfx} onChange={e=>setSfx(e.target.checked)} />
            Enable sound effects
          </label>
        </div>
      </div>
    </div>
  );
}
