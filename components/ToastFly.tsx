"use client";
import { useEffect, useState } from "react";
export default function ToastFly({ text, onDone }: { text: string; onDone?: () => void }) {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => { setShow(false); onDone?.(); }, 1600); return () => clearTimeout(t); }, []);
  return (
    <div className="pointer-events-none fixed inset-0 grid place-items-center z-[60]">
      <div className={`transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}`}>
        <div className="px-4 py-2 rounded-xl bg-panel/90 shadow-glowLime border border-white/10 text-sm">
          {text}
        </div>
      </div>
    </div>
  );
}