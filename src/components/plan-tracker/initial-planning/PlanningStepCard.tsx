import { CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';

interface PlanningStep {
  id: number;
  activity: string;
  owner?: string;
  expectedDuration: string;
  actualDuration?: string;
  dateCompleted?: string;
  artifact?: string;
  status: 'completed' | 'pending' | 'in_progress';
}

interface PlanningStepCardProps {
  step: PlanningStep;
  toggleStatus: (id: number) => void;
}

function getOwnerColor(owner: string | undefined): string {
  if (!owner) return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
  if (owner.includes('All Teams')) return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800';
  if (owner.includes('R&D')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  if (owner.includes('PM') || owner.includes('UX')) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
  return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
}

export function PlanningStepCard({ step, toggleStatus }: PlanningStepCardProps) {
  return (
    <div className={`p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-800 mb-3 flex items-start gap-4 ${step.status === 'completed' ? 'border-green-500 opacity-75' : 'border-blue-500'}`}>
      <button
        onClick={() => toggleStatus(step.id)}
        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-500'}`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`font-semibold text-slate-900 dark:text-slate-100 ${step.status === 'completed' ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
            {step.activity}
          </h4>
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${getOwnerColor(step.owner)}`}>
            {step.owner}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Est: {step.expectedDuration}
          </span>
          {step.actualDuration && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
              Actual: {step.actualDuration}
            </span>
          )}
          {step.dateCompleted && (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Calendar className="w-4 h-4" />
              {step.dateCompleted}
            </span>
          )}
        </div>

        {step.artifact && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Output: <span className="font-medium">{step.artifact}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
