import { Skeleton } from '../ui/Skeleton';

export function PlanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" variant="circular" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" variant="text" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" variant="text" />
                <Skeleton className="h-4 w-20" variant="text" />
                <Skeleton className="h-4 w-24" variant="text" />
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Live status skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <Skeleton className="h-6 w-48 mb-4" variant="text" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6" variant="circular" />
                  <Skeleton className="h-5 flex-1" variant="text" />
                  <Skeleton className="h-5 w-24" variant="text" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View tabs skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <Skeleton className="h-8 w-64 mb-6" variant="text" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
