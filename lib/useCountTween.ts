import { useEffect, useRef, useState } from 'react';

export function useCountTween(value: number, ms = 400) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    function step(now: number) {
      const t = Math.min(1, (now - start) / ms);
      // easeOutCubic
      const k = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * k));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, ms]);

  return display;
}
