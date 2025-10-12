// super-light inline icons (no deps)
import React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };
const S = (n?: number) => ({ width: n ?? 22, height: n ?? 22, strokeWidth: 1.6 });

export const HomeIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" />
    <path d="M5 10.5V20h14v-9.5" stroke="currentColor" />
  </svg>
);

export const NewsIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" />
    <path d="M19 7v10a2 2 0 0 1-2 2H5" stroke="currentColor" />
    <path d="M6.5 8.5h7M6.5 12h7M6.5 15.5h4" stroke="currentColor" />
  </svg>
);

export const TasksIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" />
    <path d="m8 12 2 2 4-4" stroke="currentColor" />
  </svg>
);

export const TrophyIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <path d="M8 4h8v3a4 4 0 1 0 0 8v2H8v-2a4 4 0 1 0 0-8V4Z" stroke="currentColor" />
    <path d="M7 20h10" stroke="currentColor" />
  </svg>
);

export const ShopIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16l-1.2 9.6a2 2 0 0 1-2 1.7H7.2a2 2 0 0 1-2-1.7L4 7Z" stroke="currentColor" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" />
  </svg>
);

export const BagIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" />
    <path d="M9 8a3 3 0 1 1 6 0" stroke="currentColor" />
  </svg>
);

export const UserIcon = ({ size, ...p }: P) => (
  <svg {...S(size)} {...p} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" />
    <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" />
  </svg>
);

