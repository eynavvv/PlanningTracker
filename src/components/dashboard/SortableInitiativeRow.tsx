import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Trash2, GripVertical, ChevronRight, ChevronDown, Rocket, PartyPopper, Calendar } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RELEASE_STATUS_OPTIONS } from './constants';

interface ReleasePlan {
  id: string;
  goal: string;
  status: string;
  planning_end_date?: string;
  dev_end_date?: string;
}

interface InitialPlanning {
  planned_end_date?: string;
}

interface Initiative {
  id: string;
  name: string;
  status: string;
  pm?: string;
  ux?: string;
  group?: string;
  techLead?: string;
  developers?: string[] | string;
  detailedStatus?: string;
  releasePlans?: ReleasePlan[];
  initialPlanning?: InitialPlanning;
}

// Helper function to get the target date based on initiative phase
function getTargetDate(init: Initiative): string | null {
  switch (init.status) {
    case 'Initiative Planning':
      return init.initialPlanning?.planned_end_date || null;

    case 'Release Planning': {
      // Get earliest planning_end_date from all releases
      const planningDates = init.releasePlans
        ?.map(rp => rp.planning_end_date)
        .filter((date): date is string => !!date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      return planningDates?.[0] || null;
    }

    case 'Development': {
      // Get earliest dev_end_date from all releases
      const devDates = init.releasePlans
        ?.map(rp => rp.dev_end_date)
        .filter((date): date is string => !!date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      return devDates?.[0] || null;
    }

    default:
      return null;
  }
}

interface SortableInitiativeRowProps {
  init: Initiative;
  handleFieldChange: (id: string, field: string, value: string | string[]) => void;
  handleReleasePhaseChange: (initiativeId: string, releaseId: string, newStatus: string) => void;
  handleDeleteInitiative: (id: string, name: string) => void;
  STATUS_OPTIONS: string[];
  GROUP_OPTIONS: string[];
}

export function SortableInitiativeRow({
  init,
  handleFieldChange,
  handleReleasePhaseChange,
  handleDeleteInitiative,
  STATUS_OPTIONS,
  GROUP_OPTIONS,
}: SortableInitiativeRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: init.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto' as const,
    position: 'relative' as const,
  };

  return (
    <React.Fragment>
      <tr
        ref={setNodeRef}
        style={style}
        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isDragging ? 'bg-white dark:bg-slate-800 shadow-lg opacity-80' : ''}`}
      >
        <td className="w-10 px-4">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-2">
            {init.releasePlans && init.releasePlans.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="w-5 h-5 min-w-[20px] min-h-[20px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm rounded-full text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all flex items-center justify-center flex-shrink-0"
                style={{ aspectRatio: '1/1', padding: '0' }}
                title={isExpanded ? 'Collapse' : 'Expand Releases'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
            <div className="relative group w-fit max-w-full min-w-0">
              <Link
                to={`/plan/${encodeURIComponent(init.id)}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium truncate block"
              >
                {init.name}
              </Link>

              {init.detailedStatus && (
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 p-3 bg-ss-navy text-white rounded-lg shadow-xl z-[100] w-72 pointer-events-none before:content-[''] before:absolute before:top-full before:left-6 before:border-8 before:border-transparent before:border-t-ss-navy">
                  <div className="text-xs font-bold mb-2 border-b border-blue-400/30 pb-1 text-center truncate">{init.name}</div>
                  <div className="text-blue-300 text-[9px] uppercase tracking-widest font-black mb-1 opacity-80">Current Focus</div>
                  <div className="text-[10px] italic text-blue-50 leading-relaxed bg-blue-900/40 p-2 rounded-lg border border-blue-400/10">
                    "{init.detailedStatus}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <select
            value={init.status}
            onChange={(e) => handleFieldChange(init.id, 'status', e.target.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-full text-center border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all ${
              init.status === 'Initiative Planning'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                : init.status === 'Release Planning'
                ? 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
                : init.status === 'Development'
                ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                : init.status === 'Released'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4">
          {(() => {
            const targetDate = getTargetDate(init);
            if (!targetDate) {
              return (
                <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>—</span>
                </div>
              );
            }
            return (
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(targetDate), 'MMM d, yyyy')}</span>
              </div>
            );
          })()}
        </td>
        <td className="px-6 py-4">
          <select
            value={init.group || ''}
            onChange={(e) => handleFieldChange(init.id, 'group', e.target.value)}
            className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600 dark:text-slate-300"
          >
            <option value="">Select Group</option>
            {GROUP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 text-slate-500 text-xs text-right">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteInitiative(init.id, init.name);
            }}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete Initiative"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
      {isExpanded &&
        !isDragging &&
        init.releasePlans?.map((rp) => (
          <tr key={rp.id} className="bg-blue-50/30 dark:bg-blue-900/20 border-l-4 border-l-blue-400 transition-colors border-b border-slate-100/50 dark:border-slate-700/50">
            <td className="px-4"></td>
            <td className="px-6 py-3">
              <div className="flex items-center gap-2 pl-6">
                <Rocket className="w-3.5 h-3.5 text-blue-400" />
                <Link
                  to={`/plan/${encodeURIComponent(init.id)}?view=release_plans#release-${rp.id}`}
                  className="text-slate-600 dark:text-slate-300 font-medium text-xs hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors truncate"
                  title={rp.goal}
                >
                  {rp.goal}
                </Link>
              </div>
            </td>
            <td className="px-6 py-3">
              <select
                value={rp.status}
                onChange={(e) => handleReleasePhaseChange(init.id, rp.id, e.target.value)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-full text-center border focus:ring-2 focus:ring-blue-400 outline-none transition-all ${
                  rp.status === 'Planning'
                    ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
                    : rp.status === 'Development'
                    ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                    : rp.status === 'Released'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {RELEASE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-6 py-3" colSpan={3}>
              <div className="flex items-center gap-4 whitespace-nowrap">
                {rp.status === 'Planning' && rp.planning_end_date && (
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50/50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full border border-purple-100/50 dark:border-purple-800/50 uppercase tracking-tight">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {format(new Date(rp.planning_end_date), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {rp.status === 'Development' && rp.dev_end_date && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-100/50 dark:border-amber-800/50 uppercase tracking-tight">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {format(new Date(rp.dev_end_date), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {rp.status === 'Released' && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-800/50 uppercase tracking-tight animate-bounce">
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>Liftoff!</span>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
    </React.Fragment>
  );
}
