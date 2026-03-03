import { Skeleton } from '../ui/Skeleton';

export function PlanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-inter">
      {/* Sticky header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <Skeleton className="h-9 w-9" variant="circular" />
              <div>
                {/* Initiative name + status badge */}
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-7 w-64 rounded-lg" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                {/* PM / UX / Tech Lead / Group */}
                <div className="flex items-center gap-6">
                  <Skeleton className="h-4 w-24" variant="text" />
                  <Skeleton className="h-4 w-24" variant="text" />
                  <Skeleton className="h-4 w-28" variant="text" />
                  <Skeleton className="h-4 w-20" variant="text" />
                </div>
              </div>
            </div>
            {/* Sync status */}
            <Skeleton className="h-4 w-28" variant="text" />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1">
        <div className="max-w-[1800px] mx-auto p-6">
          {/* Tab bar + guidelines button */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 flex gap-1 shadow-sm">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-9" variant="circular" />
          </div>

          {/* Live Status tab content */}
          <div className="flex flex-col gap-5">
            {/* Status strip */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center gap-4">
              <Skeleton className="h-8 w-36 rounded-full" />
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-5 w-20" variant="text" />
              </div>
            </div>

            {/* 50/50 two-column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left column: detailed status textarea + activity feed */}
              <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  <Skeleton className="h-4 w-32 mb-3" variant="text" />
                  <Skeleton className="h-[280px] w-full rounded-lg" />
                </div>
                {/* Activity feed collapsed row */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-28" variant="text" />
                  <Skeleton className="h-4 w-4" variant="circular" />
                </div>
              </div>

              {/* Right column: deliverables */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-32" variant="text" />
                  <Skeleton className="h-5 w-16" variant="text" />
                </div>
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <Skeleton className="h-5 w-5 shrink-0" variant="circular" />
                      <Skeleton className="h-4 flex-1" variant="text" />
                      <Skeleton className="h-4 w-20 shrink-0" variant="text" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
