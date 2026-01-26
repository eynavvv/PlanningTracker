export function DashboardHeader() {
  return (
    <div className="flex items-center gap-5">
      <img src="/logo.png" alt="SundaySky" className="h-16 w-auto" />
      <div>
        <h1 className="text-3xl font-bold text-ss-navy dark:text-slate-100">Initiatives Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all strategic initiatives.</p>
      </div>
    </div>
  );
}
