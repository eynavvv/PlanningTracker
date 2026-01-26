import { useState } from 'react';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';

export function ReleaseProcessGuidelines() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Initiative Planning - Release Planning Guidelines
        </span>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 text-sm text-slate-700 dark:text-slate-300 space-y-6 text-left">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Goals:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Break initiative to 2-4 releases</li>
              <li>Break release 1 to epics with low uncertainty</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Internal steps:</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>PM creates a release plan proposal</li>
              <li>PM & Ux align R&D - PRD, use-cases, figma (mid fidelity), release plan proposal (note that in many cases R&D was part of the solutioning)</li>
              <li>
                Iterate internally (PM, UX, R&D) and with stakeholders (field) to close gaps
                <ul className="list-[circle] pl-5 mt-1 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>R&D should lower uncertainty: technological risks, bottlenecks, infrastructure changes, etc.</li>
                  <li>R&D should build a high-level work plan for 4-5 weeks of 3-4 people</li>
                  <li>UX should clarify figma questions, mainly re components</li>
                </ul>
              </li>
              <li>PM and R&D lead (will be named by activity) come up with epics for the release 1</li>
            </ol>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r">
            <p className="font-medium text-amber-800 dark:text-amber-400">Note:</p>
            <p className="text-amber-700 dark:text-amber-300">An implicit goal of this step is to avoid descoping during the planning phase. This should be achieved by reducing uncertainty and allocating a reasonable buffer.</p>
          </div>
        </div>
      )}
    </div>
  );
}
