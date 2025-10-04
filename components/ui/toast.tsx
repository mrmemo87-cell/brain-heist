'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: number; text: string };
const Ctx = createContext<{ push: (text: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((text: string) => setList(l => [...l, { id: Date.now(), text }]), []);
  useEffect(() => {
    if (!list.length) return;
    const t = setTimeout(() => setList(l => l.slice(1)), 2200);
    return () => clearTimeout(t);
  }, [list]);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2 z-50">
        {list.map(t => (
          <div key={t.id} className="px-4 py-2 rounded-xl bg-ink-900 text-ink-50 shadow-soft border border-ink-800">
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx.push;
}
