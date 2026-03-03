import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReleaseData } from '../hooks/useReleaseData';
import { Calendar, Plus, X, Trash2, Target, ChevronDown, ChevronUp, Check, History, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { getStatusColor } from './plan-tracker/utils/statusColors';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_COLORS = {
    'Initiative Planning': 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    'Release Planning': 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    'Development': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    'Released': 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800',
    'Post Release': 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800',
};

const InitiativeLiveStatus = () => {
    const navigate = useNavigate();
    const { data, updateInitiativeMeta, addDeliverable, updateDeliverable, deleteDeliverable, archiveDetailedStatus } = useReleaseData();
    const initiative = data?.Initiative || {};

    const nonPendingReleases = (data?.Initiative?.ReleasePlan || []).filter(
        (r) => r.status && r.status.toLowerCase() !== 'pending'
    );
    const [isAdding, setIsAdding] = useState(false);
    const [newDeliverableName, setNewDeliverableName] = useState('');
    const [newDeliverableDate, setNewDeliverableDate] = useState('');
    const [isFeedExpanded, setIsFeedExpanded] = useState(false);
    const [editingDateId, setEditingDateId] = useState(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deliverables = initiative.deliverables || [];
    const doneCount = deliverables.filter(d => d.status === 'done').length;
    const isOverdue = (del) => del.status !== 'done' && del.date && new Date(del.date + 'T00:00:00') < today;
    const overdueCount = deliverables.filter(isOverdue).length;

    const handleAddDeliverable = (e) => {
        if (e) e.preventDefault();
        if (!newDeliverableName) return;
        addDeliverable({ name: newDeliverableName, date: newDeliverableDate || '', status: 'pending' });
        setNewDeliverableName('');
        setNewDeliverableDate('');
        setIsAdding(false);
    };

    const statusClass = STATUS_COLORS[initiative.Status] || 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';

    const sortedDeliverables = [...deliverables].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    return (
        <div className="space-y-4">
            {/* Top strip: Overall Status + release pills + stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-3 flex items-center gap-4 min-w-0">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Overall Status
                </label>
                <select
                    value={initiative.Status || 'Initiative Planning'}
                    onChange={(e) => updateInitiativeMeta('Status', e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border-2 font-black text-sm transition-all outline-none cursor-pointer flex-shrink-0 ${statusClass}`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Initiative Planning">Initiative Planning</option>
                    <option value="Release Planning">Release Planning</option>
                    <option value="Development">Development</option>
                    <option value="Released">Released</option>
                    <option value="Post Release">Post Release</option>
                </select>

                {nonPendingReleases.length > 0 && (
                    <>
                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
                        <div className="relative flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
                                {nonPendingReleases.map((release) => (
                                    <button
                                        key={release.id}
                                        onClick={() => navigate(`?view=release_plans#release-${release.id}`)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex-shrink-0 group/pill"
                                    >
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap max-w-[140px] truncate">
                                            {release.goal}
                                        </span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${getStatusColor(release.status)}`}>
                                            {release.status}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover/pill:text-blue-400 transition-colors flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-800 to-transparent pointer-events-none" />
                        </div>
                    </>
                )}

                {nonPendingReleases.length === 0 && <div className="flex-1" />}

                {deliverables.length > 0 && (
                    <div className="flex items-center gap-4 text-[11px] font-bold flex-shrink-0">
                        <span className="text-slate-400">
                            <span className="text-slate-700 dark:text-slate-200">{doneCount}</span>/{deliverables.length} done
                        </span>
                        {overdueCount > 0 && (
                            <span className="flex items-center gap-1 text-red-500">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {overdueCount} overdue
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Main 2-column area */}
            <div className="grid grid-cols-2 gap-4 items-start">

                {/* Left: Current Focus + Activity Feed */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Current Focus / Detailed Status
                    </label>
                    <div className="relative group/focus">
                        <textarea
                            value={initiative.detailedStatus || ''}
                            onChange={(e) => updateInitiativeMeta('detailedStatus', e.target.value)}
                            className="peer w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md text-sm italic text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/30 min-h-[280px] outline-none focus:border-ss-primary/50 focus:bg-white dark:focus:bg-slate-700 transition-all resize-none shadow-sm"
                            placeholder="Type a quick summary of this week's focus..."
                        />
                        {initiative.detailedStatus && initiative.detailedStatus.trim() && (
                            <button
                                onClick={archiveDetailedStatus}
                                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all opacity-0 group-hover/focus:opacity-100 peer-focus:!opacity-0 peer-focus:pointer-events-none"
                                title="Archive this status to the Activity Feed and clear"
                            >
                                <Send className="w-3 h-3" />
                                Archive to Feed
                            </button>
                        )}
                    </div>

                    {/* Activity Feed */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setIsFeedExpanded(!isFeedExpanded)}
                            className="flex items-center justify-between px-1 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <History className="w-3 h-3" />
                                Activity Feed ({data?.updates?.length || 0})
                            </span>
                            {isFeedExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isFeedExpanded && (
                            <div className="flex flex-col gap-3 max-h-[280px] overflow-auto pr-1 animate-in slide-in-from-top-2 duration-200">
                                {!data?.updates?.length ? (
                                    <div className="text-[10px] text-slate-400 italic px-2 py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                                        No archived updates yet. Write a summary above and hit "Archive to Feed".
                                    </div>
                                ) : (
                                    data.updates.map((update) => (
                                        <div key={update.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 py-1">
                                            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-slate-400">
                                                    {new Date(update.created_at).toLocaleDateString(undefined, {
                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
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

                {/* Right: Deliverables & Milestones */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Deliverables & Milestones
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

                    {isAdding && (
                        <form onSubmit={handleAddDeliverable} className="bg-ss-navy/5 p-4 rounded-2xl border-2 border-ss-navy/10 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex-1">
                                <input
                                    autoFocus
                                    value={newDeliverableName}
                                    onChange={(e) => setNewDeliverableName(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="w-full text-sm p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-ss-primary transition-all font-bold text-ss-navy dark:text-slate-100"
                                />
                            </div>
                            <div className="w-34">
                                <input
                                    type="date"
                                    value={newDeliverableDate}
                                    onChange={(e) => setNewDeliverableDate(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-ss-navy dark:text-slate-100 outline-none focus:border-ss-primary transition-all font-black"
                                />
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    type="submit"
                                    disabled={!newDeliverableName}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${!newDeliverableName ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Column headers */}
                    <div className="flex items-center gap-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="w-6" />
                        <div className="flex-1">Task / Deliverable</div>
                        <div className="w-20 text-center">Due Date</div>
                        <div className="w-8" />
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-2 overflow-auto custom-scrollbar max-h-[500px]">
                        {sortedDeliverables.length === 0 && !isAdding ? (
                            <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400">
                                <Target className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                                <span className="text-sm">No deliverables yet.</span>
                            </div>
                        ) : (
                            sortedDeliverables.map((del) => {
                                const overdue = isOverdue(del);
                                return (
                                    <div
                                        key={del.id}
                                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                                            del.status === 'done'
                                                ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50'
                                                : overdue
                                                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm'
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => updateDeliverable(del.id, { status: del.status === 'done' ? 'pending' : 'done' })}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                del.status === 'done'
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : overdue
                                                        ? 'border-red-400 text-transparent hover:border-red-500 bg-white'
                                                        : 'border-slate-300 text-transparent hover:border-slate-400 bg-white'
                                            }`}
                                            style={{ minWidth: '24px' }}
                                        >
                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                        </button>

                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <input
                                                value={del.name}
                                                onChange={(e) => updateDeliverable(del.id, { name: e.target.value })}
                                                className={`w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none ${
                                                    del.status === 'done'
                                                        ? 'text-slate-400 line-through italic'
                                                        : overdue
                                                            ? 'text-red-700 dark:text-red-400'
                                                            : 'text-ss-navy dark:text-white'
                                                }`}
                                                placeholder="Deliverable name..."
                                            />
                                        </div>

                                        {/* Due date */}
                                        <div className="w-20 flex-shrink-0">
                                            {editingDateId === del.id ? (
                                                <input
                                                    type="date"
                                                    autoFocus
                                                    value={del.date || ''}
                                                    onChange={(e) => updateDeliverable(del.id, { date: e.target.value })}
                                                    onBlur={() => setEditingDateId(null)}
                                                    className="w-full text-xs p-1 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 text-ss-navy dark:text-white outline-none font-black"
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingDateId(del.id)}
                                                    className={`flex items-center justify-center gap-1 cursor-pointer px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                                        del.date
                                                            ? overdue
                                                                ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                                                : del.status === 'done'
                                                                    ? 'text-slate-400 border-slate-100 dark:border-slate-700'
                                                                    : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600'
                                                            : 'text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-400 italic'
                                                    }`}
                                                >
                                                    {overdue && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                                                    {del.date ? formatDate(del.date) : '+ date'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Delete */}
                                        <div className="w-8 flex justify-center">
                                            <button
                                                onClick={() => deleteDeliverable(del.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitiativeLiveStatus;
