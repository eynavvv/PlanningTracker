import { Link as LinkIcon, Trash2 } from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';

interface Epic {
  Name?: string;
  description?: string;
  loe?: string;
  figma?: string;
  Link?: string;
  Status?: string;
}

interface EpicRowProps {
  epic: Epic;
  planIndex: number;
  epicIndex: number;
  updateEpic: (planIndex: number, epicIndex: number, field: string, value: string) => void;
  deleteEpic: (planIndex: number, epicIndex: number) => void;
}

export function EpicRow({ epic, planIndex, epicIndex, updateEpic, deleteEpic }: EpicRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 text-xs">
      <td className="px-3 py-2">
        <input
          value={epic.Name || ''}
          onChange={(e) => updateEpic(planIndex, epicIndex, 'Name', e.target.value)}
          className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full font-semibold text-slate-900 dark:text-slate-100"
          placeholder="Epic Name"
          title={epic.Name}
        />
      </td>
      <td className="px-3 py-2">
        <textarea
          value={epic.description || ''}
          onChange={(e) => updateEpic(planIndex, epicIndex, 'description', e.target.value)}
          className="bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 focus:outline-none w-full min-h-[40px] p-1 rounded resize-none text-slate-700 dark:text-slate-300"
          placeholder="Description..."
          title={epic.description}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          value={epic.loe || ''}
          onChange={(e) => updateEpic(planIndex, epicIndex, 'loe', e.target.value)}
          className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-12 text-center text-slate-700 dark:text-slate-300"
          placeholder="W"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <input
            value={epic.figma || ''}
            title={epic.figma || ''}
            onChange={(e) => updateEpic(planIndex, epicIndex, 'figma', e.target.value)}
            className="bg-transparent border-b border-transparent focus:border-ss-primary focus:outline-none flex-1 text-ss-primary text-xs truncate"
            placeholder="Link"
          />
          {epic.figma && (
            <a href={epic.figma} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors flex-shrink-0">
              <LinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <input
            value={epic.Link || ''}
            title={epic.Link || ''}
            onChange={(e) => updateEpic(planIndex, epicIndex, 'Link', e.target.value)}
            placeholder="Link"
            className="bg-transparent border-b border-transparent focus:border-ss-primary focus:outline-none flex-1 text-ss-primary text-xs truncate"
          />
          {epic.Link && (
            <a href={epic.Link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors flex-shrink-0">
              <LinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <select
          value={epic.Status || ''}
          onChange={(e) => updateEpic(planIndex, epicIndex, 'Status', e.target.value)}
          className={`w-full px-2 py-1 rounded border-none text-[10px] font-bold uppercase tracking-tight focus:ring-2 outline-none ${getStatusColor(epic.Status)}`}
        >
          <option value="Pending">Pending</option>
          <option value="Planning">Planning</option>
          <option value="Ready for review">Ready for review</option>
          <option value="Ready for dev">Ready for dev</option>
          <option value="Dev">Dev</option>
          <option value="Done">Done</option>
        </select>
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteEpic(planIndex, epicIndex);
          }}
          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Delete Epic"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
