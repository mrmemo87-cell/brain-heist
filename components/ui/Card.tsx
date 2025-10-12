import clsx from 'clsx';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx('bg-ink-900/80 rounded-2xl p-4 shadow-soft border border-ink-800', className)} />;
}
export function CardRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx('flex items-center justify-between gap-3', className)} />;
}

