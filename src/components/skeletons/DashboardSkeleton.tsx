import { Skeleton } from '../ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" variant="text" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Timeline skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-5 w-5" variant="circular" />
          <Skeleton className="h-6 w-32" variant="text" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-6">
            <Skeleton className="h-5 w-32" variant="text" />
            <Skeleton className="h-5 w-24" variant="text" />
            <Skeleton className="h-5 w-20" variant="text" />
            <Skeleton className="h-5 w-20" variant="text" />
            <Skeleton className="h-5 w-24" variant="text" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6"
          >
            <Skeleton className="h-8 w-8" variant="circular" />
            <Skeleton className="h-5 w-48" variant="text" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-5 w-16" variant="text" />
            <Skeleton className="h-5 w-16" variant="text" />
            <Skeleton className="h-5 w-20" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}
