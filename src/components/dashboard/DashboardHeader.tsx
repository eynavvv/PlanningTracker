export function DashboardHeader() {
  return (
    <div className="flex items-center gap-5 pb-4">
      <img src="/logo.png" alt="SundaySky" className="h-16 w-auto dark:brightness-0 dark:invert" />
      <div className="text-left">
        <h1 className="text-3xl font-bold text-ss-navy dark:text-slate-100 mb-0.5 leading-tight">Roadmap Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage and track roadmap items</p>
      </div>
    </div>
  );
}
