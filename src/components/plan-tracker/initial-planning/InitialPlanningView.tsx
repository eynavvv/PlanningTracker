import { Clock, Link as LinkIcon } from 'lucide-react';
import { PlanningGuidelines, ReleaseProcessGuidelines } from '../guidelines';
import { getStatusColor } from '../utils/statusColors';

interface InitialPlanning {
  StartDate?: string;
  PlannedEndDate?: string;
  Status?: string;
  PRD?: string;
  Figma?: string;
  ReleasePlanSummary?: string;
}

interface InitialPlanningViewProps {
  data: {
    Initiative?: {
      InitialPlanning?: InitialPlanning;
    };
  };
  updateInitialPlanning: (field: string, value: string) => void;
}

export function InitialPlanningView({ data, updateInitialPlanning }: InitialPlanningViewProps) {
  const planning = data.Initiative?.InitialPlanning || {};

  return (
    <div className="space-y-6">
      <PlanningGuidelines />
      <ReleaseProcessGuidelines />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Planning Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={planning.StartDate || ''}
              onChange={(e) => updateInitialPlanning('StartDate', e.target.value)}
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Planned End Date</label>
            <input
              type="date"
              value={planning.PlannedEndDate || ''}
              onChange={(e) => updateInitialPlanning('PlannedEndDate', e.target.value)}
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={planning.Status || ''}
              onChange={(e) => updateInitialPlanning('Status', e.target.value)}
              className={`w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded outline-none text-sm font-medium focus:ring-2 ${getStatusColor(planning.Status)}`}
            >
              <option value="">Select Status</option>
              <option value="PRD">PRD</option>
              <option value="Solutioning">Solutioning</option>
              <option value="Release plan planning">Release plan planning</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">PRD Link</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={planning.PRD || ''}
                onChange={(e) => updateInitialPlanning('PRD', e.target.value)}
                placeholder="https://..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.PRD && (
                <a href={planning.PRD} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Figma Link</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={planning.Figma || ''}
                onChange={(e) => updateInitialPlanning('Figma', e.target.value)}
                placeholder="https://..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.Figma && (
                <a href={planning.Figma} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Release Plan Doc</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={planning.ReleasePlanSummary || ''}
                onChange={(e) => updateInitialPlanning('ReleasePlanSummary', e.target.value)}
                placeholder="https://..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.ReleasePlanSummary && (
                <a href={planning.ReleasePlanSummary} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
