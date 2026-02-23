import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Plus, X, Trash2, Check, History, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { TaskDeliverable, TaskUpdate } from '@/types';

interface TaskLiveStatusProps {
  taskId: string;
  initialDetailedStatus?: string;
  onUpdateDetailedStatus: (value: string) => void;
}

export default function TaskLiveStatus({ taskId, initialDetailedStatus, onUpdateDetailedStatus }: TaskLiveStatusProps) {
  const [detailedStatus, setDetailedStatus] = useState(initialDetailedStatus || '');
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDeliverableName, setNewDeliverableName] = useState('');
  const [newDeliverableDate, setNewDeliverableDate] = useState('');
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dataService.getTaskDeliverables(taskId).then(setDeliverables);
    dataService.getTaskUpdates(taskId).then(setUpdates);
  }, [taskId]);

  useEffect(() => {
    setDetailedStatus(initialDetailedStatus || '');
  }, [initialDetailedStatus]);

  const handleStatusChange = useCallback((value: string) => {
    setDetailedStatus(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdateDetailedStatus(value);
    }, 500);
  }, [onUpdateDetailedStatus]);

  const handleArchive = async () => {
    if (!detailedStatus.trim()) return;
    const newUpdate = await dataService.createTaskUpdate(taskId, detailedStatus.trim());
    setUpdates(prev => [newUpdate, ...prev]);
    setDetailedStatus('');
    onUpdateDetailedStatus('');
  };

  const handleAddDeliverable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDeliverableName) return;
    const created = await dataService.createTaskDeliverable(taskId, {
      name: newDeliverableName,
      date: newDeliverableDate || '',
      status: 'pending',
    });
    setDeliverables(prev => [...prev, { id: created.id, task_id: taskId, name: created.name, date: created.date, status: created.status || 'pending' }]);
    setNewDeliverableName('');
    setNewDeliverableDate('');
    setIsAdding(false);
  };

  const handleToggleDeliverable = async (del: TaskDeliverable) => {
    const newStatus = del.status === 'done' ? 'pending' : 'done';
    await dataService.updateTaskDeliverable(del.id, { status: newStatus });
    setDeliverables(prev => prev.map(d => d.id === del.id ? { ...d, status: newStatus } : d));
  };

  const handleUpdateDeliverableName = async (id: string, name: string) => {
    await dataService.updateTaskDeliverable(id, { name });
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const handleUpdateDeliverableDate = async (id: string, date: string) => {
    await dataService.updateTaskDeliverable(id, { date: date || null });
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, date } : d));
  };

  const handleDeleteDeliverable = async (id: string) => {
    await dataService.deleteTaskDeliverable(id);
    setDeliverables(prev => prev.filter(d => d.id !== id));
  };

  const sortedDeliverables = [...deliverables].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700">
      {/* Column 1: Focus & Activity Feed */}
      <div className="flex flex-col gap-6">
        <div className="relative group/focus">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1 underline decoration-slate-200 dark:decoration-slate-700 underline-offset-4">
            Current Focus / Detailed Status
          </label>
          <textarea
            value={detailedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="peer w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-sm italic text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 min-h-[140px] outline-none focus:border-blue-400/50 transition-all resize-none shadow-sm"
            placeholder="Type a quick summary..."
          />
          {detailedStatus && detailedStatus.trim() && (
            <button
              onClick={handleArchive}
              className="absolute bottom-3 right-3 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 rounded-lg p-1.5 transition-colors opacity-0 group-hover/focus:opacity-100 peer-focus:!opacity-0 peer-focus:pointer-events-none"
              title="Archive this status to the Activity Feed and clear"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Activity Feed */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsFeedExpanded(!isFeedExpanded)}
            className="flex items-center justify-between px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="w-3 h-3" />
              Activity Feed ({updates.length})
            </span>
            {isFeedExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isFeedExpanded && (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-auto pr-1 animate-in slide-in-from-top-2 duration-200">
              {updates.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic px-2 py-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                  No archived updates yet.
                </div>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 py-1">
                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400">
                        {new Date(update.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                        {update.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Deliverables */}
      <div className="flex flex-col gap-4 border-l border-slate-100 dark:border-slate-700 lg:pl-8">
        <div className="flex justify-between items-center px-1 mb-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Next Deliverables & Milestones
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold">
              {deliverables.length}
            </span>
          </label>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {isAdding && (
            <form onSubmit={handleAddDeliverable} className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border-2 border-blue-100/50 dark:border-blue-900/30 flex items-center gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex-1">
                <input
                  autoFocus
                  value={newDeliverableName}
                  onChange={(e) => setNewDeliverableName(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full text-sm p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-400 transition-all font-bold text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="w-36">
                <input
                  type="date"
                  value={newDeliverableDate}
                  onChange={(e) => setNewDeliverableDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all font-black"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={!newDeliverableName}
                  className={`w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center transition-all overflow-visible ${
                    !newDeliverableName
                      ? 'bg-slate-200 border-2 border-slate-200 text-slate-400'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-sm text-white'
                  }`}
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5 flex-shrink-0" />
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {/* Headers */}
            <div className="flex items-center gap-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
              <div className="w-8"></div>
              <div className="flex-1">TASK / DELIVERABLE</div>
              <div className="w-36 text-center">DUE DATE</div>
              <div className="w-10 text-center">DEL</div>
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-auto flex flex-col gap-3 pr-1 custom-scrollbar">
              {sortedDeliverables.map((del) => (
                <div
                  key={del.id}
                  className={`group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-xl flex items-center gap-3 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all ${
                    del.status === 'done' ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''
                  }`}
                >
                  <button
                    onClick={() => handleToggleDeliverable(del)}
                    className={`w-7 h-7 max-w-[28px] max-h-[28px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      del.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-400 text-transparent hover:border-slate-500'
                    }`}
                    style={{ aspectRatio: '1/1', padding: '0' }}
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </button>

                  <div className="flex-1">
                    <input
                      value={del.name}
                      onChange={(e) => handleUpdateDeliverableName(del.id, e.target.value)}
                      className={`w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none ${
                        del.status === 'done' ? 'text-slate-400 line-through italic' : 'text-slate-800 dark:text-white'
                      }`}
                      placeholder="Deliverable name..."
                    />
                  </div>

                  <div className="w-36 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={del.date || ''}
                      onChange={(e) => handleUpdateDeliverableDate(del.id, e.target.value)}
                      className="bg-transparent border-none p-0 text-[11px] font-black text-slate-800 dark:text-white focus:ring-0 outline-none cursor-pointer w-full text-center"
                    />
                  </div>

                  <div className="w-10 flex justify-center">
                    <button
                      onClick={() => handleDeleteDeliverable(del.id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
