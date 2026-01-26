interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-700',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
    />
  );
}
