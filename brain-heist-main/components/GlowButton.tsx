'use client';
import { ButtonHTMLAttributes } from 'react';

export default function GlowButton(
  { className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={[
        'relative inline-flex items-center justify-center rounded-2xl px-4 py-2',
        'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold',
        'shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-300/30',
        'transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      ].join(' ')}
    >
      <span className="absolute inset-0 rounded-2xl blur-md bg-cyan-400/20 pointer-events-none" />
      <span className="relative">{children}</span>
    </button>
  );
}
