import { useReleaseData } from '../../hooks/useReleaseData';
import { InitialPlanningView } from './initial-planning';
import { ReleasePlansView } from './release-plans';

interface PlanTrackerProps {
  activeView?: 'initial_planning' | 'release_plans';
}

export function PlanTracker({ activeView }: PlanTrackerProps) {
  const {
    data,
    isLoading,
    updateInitialPlanning,
    updateReleasePlan,
    addReleasePlan,
    deleteReleasePlan,
    updateEpic,
    addEpic,
    deleteEpic,
  } = useReleaseData();

  if (isLoading || !data) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Loading Plan Data...</span>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedData = data as any;

  return (
    <div className="animate-in fade-in duration-500">
      {typedData.isUsingDefault && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 p-2 text-center text-xs text-amber-800 dark:text-amber-400 mb-6 rounded-xl">
          <strong>Note:</strong> Showing demo data. Configure <code>SHEET_ID</code> in <code>src/services/googleSheets.js</code> to connect your data.
        </div>
      )}

      {(activeView === 'initial_planning' || !activeView) && (
        <InitialPlanningView data={data} updateInitialPlanning={updateInitialPlanning} />
      )}

      {activeView === 'release_plans' && (
        <ReleasePlansView
          data={data}
          updateReleasePlan={updateReleasePlan}
          addReleasePlan={addReleasePlan}
          deleteReleasePlan={deleteReleasePlan}
          updateEpic={updateEpic}
          addEpic={addEpic}
          deleteEpic={deleteEpic}
        />
      )}
    </div>
  );
}

export default PlanTracker;
