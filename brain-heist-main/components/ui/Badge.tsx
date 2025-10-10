import clsx from 'clsx';

export default function Badge({ children, className }: {children: React.ReactNode; className?: string}) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full bg-ink-800 text-ink-200', className)}>
      {children}
    </span>
  );
}
