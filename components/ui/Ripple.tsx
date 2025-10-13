'use client';

import React from 'react';

export function addRipple(e: React.MouseEvent<HTMLElement>) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.className = 'bh-ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  target.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
  // subtle haptic (Android)
  try {(navigator as any)?.vibrate?.(10);} catch {}
}

export function RippleBox({ children, className, ...rest }:{
  children: React.ReactNode; className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`relative overflow-hidden ${className ?? ''}`}>
      {children}
    </div>
  );
}

