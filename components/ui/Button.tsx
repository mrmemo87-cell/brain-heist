'use client';

import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
};

export default function Button({ variant='primary', size='md', className, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'rounded-xl transition active:scale-[0.98]',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary-600'
          : 'bg-ink-800 hover:bg-ink-700 text-ink-100',
        className
      )}
    />
  );
}
