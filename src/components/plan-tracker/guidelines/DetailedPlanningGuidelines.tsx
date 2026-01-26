import { useState } from 'react';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';

const steps = [
  { id: 1, by: 'All', activity: 'Planning kickoff meeting (1h): go over concept, epics, existing flows\nIf relevant - provide feedback by the end of the day', time: '1 day [W1 Sun]', output: '' },
  { id: 2, by: 'PM, UX', activity: 'Mature flows (not a final figma)', time: '2-3 days', output: 'All flows, figma & AC drafts' },
  { id: 3, by: 'All', activity: 'Meeting: go over flows and identify gaps', time: '2 hours [W1 Wed]', output: '' },
  { id: 4, by: 'PM, UX', activity: 'Finalize figma & AC (on top of figma) for all epics (release as you go)', time: 'up to 3 days', output: 'final figma & AC' },
  { id: 5, by: 'R&D', activity: 'Review figma', time: '1 cal day / epic', output: '' },
  { id: 6, by: 'All', activity: 'Meeting: identify/close all open issues and gaps\nMay require offline work by PM, UX', time: 'Up to 1d [W2 Mon]', output: 'Approved figma' },
  { id: 7, by: 'R&D', activity: 'Story breakdown', time: '1h / epic', output: '' },
  { id: 8, by: 'All', activity: 'Timeline for PM, UX reviews & QA event(s)', time: '1h [W2 Thu]', output: 'Plan' },
];

export function DetailedPlanningGuidelines() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Detailed Planning Guidelines - 2 Weeks
        </span>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 overflow-x-auto text-left">
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Duration:</strong> 2 weeks</li>
              <li><strong>Participants:</strong> Product, UX, R&D</li>
              <li>In brackets: recommended days</li>
            </ul>
          </div>

          <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-600">
            <thead className="bg-slate-800 text-slate-200 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-3 py-2 border-r border-slate-700 w-10 text-center">Step</th>
                <th className="px-3 py-2 border-r border-slate-700 w-16 text-center">By</th>
                <th className="px-3 py-2 border-r border-slate-700">Activity</th>
                <th className="px-3 py-2 border-r border-slate-700 w-32">Net time</th>
                <th className="px-3 py-2">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {steps.map((step) => (
                <tr key={step.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-slate-700 text-center font-medium bg-slate-50 dark:bg-slate-800">{step.id}</td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-slate-700 text-center font-medium text-slate-700 dark:text-slate-300">{step.by}</td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-slate-700 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{step.activity}</td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">{step.time}</td>
                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{step.output}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700 italic">
            During this phase, items that require more time than expected (from Initiative Planning) either consume the buffer or require hacks by R&D (and added to the technical debt bucket).
          </div>
        </div>
      )}
    </div>
  );
}
