import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, GripVertical, ExternalLink, Calendar, Layers, ChevronDown, ChevronUp, Pencil, Activity, Archive, ArchiveRestore } from 'lucide-react';
import TaskLiveStatus from '@/components/TaskLiveStatus';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, TaskPhase, TaskType, TaskBacklog } from '@/types';
import { TASK_PHASE_OPTIONS, TASK_TYPE_OPTIONS, TASK_BACKLOG_OPTIONS } from '@/types';
import { GROUP_OPTIONS } from './constants';

interface RoadmapFillersProps {
  tasks: Task[];
  archivedTasks?: Task[];
  onAddTask: () => void;
  onDeleteTask: (id: string, name: string) => void;
  onUpdateTask: (id: string, field: string, value: string | string[]) => void;
  onReorderTasks: (orderedIds: string[]) => void;
  onArchiveTask?: (id: string) => void;
  onUnarchiveTask?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  highlightedTaskId?: string | null;
}

interface SortableTaskRowProps {
  task: Task;
  onUpdate: (id: string, field: string, value: string | string[]) => void;
  onArchive?: (id: string) => void;
  isHighlighted?: boolean;
}

function SortableTaskRow({ task, onUpdate, onArchive, isHighlighted = false }: SortableTaskRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
      rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto' as const,
    position: 'relative' as const,
  };

  const getPhaseStyles = (phase: TaskPhase) => {
    switch (phase) {
      case 'Planning':
        return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Development':
        return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Released':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case 'Dev':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'POC':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Research':
        return 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
      default:
        return 'bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getBacklogStyles = (backlog?: string) => {
    switch (backlog) {
      case 'R&D':
        return 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
      case 'Product':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'UX':
        return 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editingField && editValue !== (task as Record<string, unknown>)[editingField]) {
      onUpdate(task.id, editingField, editValue);
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <>
    <tr
      ref={(el) => { setNodeRef(el); (rowRef as React.MutableRefObject<HTMLTableRowElement | null>).current = el; }}
      style={style}
      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isDragging ? 'bg-white dark:bg-slate-800 shadow-lg opacity-80' : ''} ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20 outline outline-2 outline-blue-400 outline-offset-[-2px]' : ''}`}
    >
      <td className="w-10 px-4">
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            title={isExpanded ? 'Collapse live status' : 'Expand live status'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
      <td className="px-6 py-4">
        {editingField === 'name' ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-2 py-1 text-sm border border-blue-400 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        ) : (
          <div
            onClick={() => startEditing('name', task.name)}
            className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 -mx-2 -my-1 rounded transition-colors"
            title={`${task.name} (click to edit)`}
          >
            {task.name}
          </div>
        )}
        {editingField === 'description' ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full mt-1 px-2 py-1 text-xs border border-blue-400 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            placeholder="Add description..."
          />
        ) : (
          <div
            onClick={() => startEditing('description', task.description || '')}
            className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-0.5 -mx-2 rounded transition-colors"
            title={task.description ? `${task.description} (click to edit)` : 'Click to add description'}
          >
            {task.description || <span className="italic text-slate-400">Add description...</span>}
          </div>
        )}
      </td>
      <td className="px-2 py-4 text-center">
        <select
          value={task.type || ''}
          onChange={(e) => onUpdate(task.id, 'type', e.target.value)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all cursor-pointer ${getTypeStyles(task.type)}`}
        >
          <option value="">—</option>
          {TASK_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4 text-center">
        <select
          value={task.phase}
          onChange={(e) => onUpdate(task.id, 'phase', e.target.value)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all cursor-pointer ${getPhaseStyles(task.phase)}`}
        >
          {TASK_PHASE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-4">
        {editingField === 'target_date' ? (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-transparent border-b border-blue-400 outline-none w-full text-slate-600 dark:text-slate-300 px-1 py-0.5 text-sm"
          />
        ) : (
          <div
            onClick={() => startEditing('target_date', task.target_date || '')}
            className="flex items-center justify-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{task.target_date ? format(new Date(task.target_date), 'MMM d, yyyy') : '—'}</span>
          </div>
        )}
      </td>
      <td className="px-2 py-4 text-center">
        <select
          value={task.backlog || ''}
          onChange={(e) => onUpdate(task.id, 'backlog', e.target.value)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all cursor-pointer ${getBacklogStyles(task.backlog)}`}
        >
          <option value="">—</option>
          {TASK_BACKLOG_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4 text-center">
        <select
          value={task.group || ''}
          onChange={(e) => onUpdate(task.id, 'group', e.target.value)}
          className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-sm text-slate-600 dark:text-slate-300"
        >
          <option value="">—</option>
          {GROUP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-4 text-center">
        {editingField === 'jira_link' ? (
          <input
            type="url"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="https://..."
            className="w-24 px-2 py-1 text-xs border border-blue-400 rounded focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          />
        ) : task.jira_link ? (
          <div className="flex items-center gap-1">
            <a
              href={task.jira_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Open in Jira"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => startEditing('jira_link', task.jira_link || '')}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded transition-colors"
              title="Edit link"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startEditing('jira_link', '')}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded transition-colors"
            title="Add Jira link"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative group/archive inline-block">
          <button
            type="button"
            onClick={() => onArchive?.(task.id)}
            className="p-1.5 text-slate-300 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
          >
            <Archive className="w-4 h-4" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/archive:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium shadow-xl">
            Archive task
            <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      </td>
    </tr>
    {isExpanded && (
      <tr>
        <td colSpan={9} className="p-0">
          <TaskLiveStatus
            taskId={task.id}
            initialDetailedStatus={task.detailed_status}
            onUpdateDetailedStatus={(value) => onUpdate(task.id, 'detailed_status', value)}
          />
        </td>
      </tr>
    )}
    </>
  );
}

export function RoadmapFillers({
  tasks,
  archivedTasks = [],
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks,
  onArchiveTask,
  onUnarchiveTask,
  isCollapsed = false,
  onToggleCollapse,
  highlightedTaskId,
}: RoadmapFillersProps) {
  const [archiveSectionOpen, setArchiveSectionOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      const newOrderedTasks = arrayMove(tasks, oldIndex, newIndex);
      onReorderTasks(newOrderedTasks.map(t => t.id));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Collapsible Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full px-6 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Roadmap Fillers</h2>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {tasks.length} ITEMS
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Table */}
      {!isCollapsed && (
        <>
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="w-10"></th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[35%]">Task</th>
                    <th className="px-2 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[80px] text-center">Type</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[120px] text-center">Phase</th>
                    <th className="px-2 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[150px] text-center">Target Date</th>
                    <th className="px-2 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[85px] text-center">Backlog</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[100px] text-center">Group</th>
                    <th className="px-2 py-3 font-semibold text-slate-900 dark:text-slate-100 w-[60px] text-center">Jira</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <SortableContext
                  items={tasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col items-center gap-3">
                            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            <p className="font-medium">No tasks yet</p>
                            <p className="text-sm">Add a task to fill your roadmap</p>
                            <button
                              onClick={onAddTask}
                              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                            >
                              Add your first task
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <SortableTaskRow
                          key={task.id}
                          task={task}
                          onUpdate={onUpdateTask}
                          onArchive={onArchiveTask}
                          isHighlighted={highlightedTaskId === task.id}
                        />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              onClick={onAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </>
      )}

      {/* Archived Tasks Section */}
      {archivedTasks.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setArchiveSectionOpen(!archiveSectionOpen)}
            className="w-full px-6 py-3 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Archive className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Archived</span>
            </div>
            {archiveSectionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {archiveSectionOpen && (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {archivedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-6 py-3 bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400 line-through truncate block">{task.name}</span>
                    {task.target_date && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(task.target_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {task.phase && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {task.phase}
                    </span>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="relative group/restore">
                      <button
                        type="button"
                        onClick={() => onUnarchiveTask?.(task.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/restore:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium shadow-xl">
                        Restore to active
                        <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                    <div className="relative group/delete">
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id, task.name)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-medium shadow-xl">
                        Delete permanently
                        <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoadmapFillers;
