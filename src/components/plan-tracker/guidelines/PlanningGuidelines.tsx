import { useState } from 'react';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';

const guidelines = [
  { type: 'Initiative from scratch', problem: '1 month', prd: '2 weeks', solutioning: '3-4 weeks', releasePlan: '2-3 weeks', total: '3 months' },
  { type: 'Capability from scratch', problem: '2 weeks', prd: '2 weeks', solutioning: '2-3 weeks', releasePlan: '2 weeks', total: '2 months' },
  { type: 'Parked initiative/capability', problem: '1-2 weeks', prd: '2-3 days', solutioning: '1 week', releasePlan: '1 week', total: '2-4 weeks' },
  { type: 'Existing capability - usability enhancements', problem: '2-5 days', prd: '2-3 days', solutioning: '1 week', releasePlan: '2-5 days', total: '2-3.5 weeks' },
  { type: 'Existing capability - functionality enhancements', problem: '2-5 days', prd: '1 week', solutioning: '1-2 weeks', releasePlan: '2-5 days', total: '2-5 weeks' },
  { type: 'Existing capability - expansion to additional', problem: '1-2 days', prd: '1-2 days', solutioning: '1-2 weeks', releasePlan: '1 week', total: '2-3.5 weeks' },
];

export function PlanningGuidelines() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Planning Guidelines - Time Estimation
        </span>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700">Type</th>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700 whitespace-nowrap">Understand Problem/Needs</th>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700">PRD</th>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700">Solutioning</th>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700">Release Plan</th>
                <th className="px-4 py-3 font-bold border-b border-slate-100 dark:border-slate-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {guidelines.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.problem}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.prd}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.solutioning}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.releasePlan}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 text-right">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
