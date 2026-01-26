export function getStatusColor(status: string | undefined | null): string {
  switch (status) {
    case 'Done':
    case 'Released':
      return 'bg-green-100 text-green-700 focus:ring-green-400 dark:bg-green-900/30 dark:text-green-400';
    case 'Post Release':
      return 'bg-emerald-100 text-emerald-700 focus:ring-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Pending':
      return 'bg-slate-100 text-slate-600 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-300';
    case 'Initiative Planning':
      return 'bg-sky-100 text-sky-700 focus:ring-sky-400 dark:bg-sky-900/30 dark:text-sky-400';
    case 'Release Planning':
      return 'bg-violet-100 text-violet-700 focus:ring-violet-400 dark:bg-violet-900/30 dark:text-violet-400';
    case 'Development':
      return 'bg-amber-100 text-amber-700 focus:ring-amber-400 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Pre-Planning':
      return 'bg-cyan-100 text-cyan-700 focus:ring-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'Planning':
      return 'bg-blue-100 text-blue-700 focus:ring-blue-400 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Release plan planning':
      return 'bg-teal-100 text-teal-700 focus:ring-teal-400 dark:bg-teal-900/30 dark:text-teal-400';
    case 'Ready for review':
      return 'bg-purple-100 text-purple-700 focus:ring-purple-400 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Ready for dev':
      return 'bg-indigo-100 text-indigo-700 focus:ring-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'Dev':
      return 'bg-amber-100 text-amber-700 focus:ring-amber-400 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PRD':
      return 'bg-orange-100 text-orange-700 focus:ring-orange-400 dark:bg-orange-900/30 dark:text-orange-400';
    case 'Solutioning':
      return 'bg-pink-100 text-pink-700 focus:ring-pink-400 dark:bg-pink-900/30 dark:text-pink-400';
    default:
      return 'bg-slate-100 text-slate-600 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-300';
  }
}
