import { X, BookOpen } from 'lucide-react';
import { PlanningGuidelines } from './PlanningGuidelines';
import { ReleaseProcessGuidelines } from './ReleaseProcessGuidelines';
import { DetailedPlanningGuidelines } from './DetailedPlanningGuidelines';

interface GuidelinesModalProps {
  onClose: () => void;
}

export function GuidelinesModal({ onClose }: GuidelinesModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-6 overflow-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mt-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Planning Guidelines</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <PlanningGuidelines initialOpen />
          <ReleaseProcessGuidelines initialOpen />
          <DetailedPlanningGuidelines initialOpen />
        </div>
      </div>
    </div>
  );
}
