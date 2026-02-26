import { Skeleton } from '../ui/Skeleton';

// Each row: spacer (s) and bar (b) flex proportions out of 100
const TIMELINE_ROWS = [
  { label: 'w-36', segs: [{s:0,b:32},{s:4,b:42}] },
  { label: 'w-28', segs: [{s:12,b:60}] },
  { label: 'w-44', segs: [{s:0,b:28},{s:5,b:38},{s:4,b:18}] },
  { label: 'w-32', segs: [{s:20,b:52}] },
  { label: 'w-40', segs: [{s:5,b:35},{s:4,b:38}] },
  { label: 'w-36', segs: [{s:0,b:30},{s:4,b:28},{s:4,b:24}] },
  { label: 'w-28', segs: [{s:15,b:65}] },
];

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-5 pb-4">
        <Skeleton className="h-16 w-16" />
        <div>
          <Skeleton className="h-8 w-56 mb-0.5" />
          <Skeleton className="h-4 w-44" variant="text" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 pb-px">
        {[{ w: 'w-20' }, { w: 'w-24' }, { w: 'w-32' }].map(({ w }, i) => (
          <div key={i} className="flex items-center gap-2 px-5 py-3">
            <Skeleton className="h-4 w-4" variant="circular" />
            <Skeleton className={`h-4 ${w}`} variant="text" />
          </div>
        ))}
      </div>

      {/* Timeline area */}
      <div className="mt-5 flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Month header */}
        <div className="flex gap-0.5">
          {[14, 18, 12, 16, 14, 10, 16].map((flex, i) => (
            <Skeleton key={i} className="h-6" style={{ flex }} />
          ))}
        </div>

        {/* Week header */}
        <div className="flex gap-0.5 -mt-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Initiative rows */}
        <div className="flex flex-col gap-3 mt-1">
          {TIMELINE_ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className={`h-4 ${row.label} shrink-0`} variant="text" />
              <div className="flex items-center flex-1">
                {row.segs.map(({ s, b }, j) => (
                  <div key={j} className="flex items-center" style={{ flex: s + b, minWidth: 0 }}>
                    <div style={{ flex: s }} />
                    <Skeleton className="h-8 rounded-lg" style={{ flex: b }} />
                  </div>
                ))}
                <div style={{ flex: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
