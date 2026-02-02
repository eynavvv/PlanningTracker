import React, { useState } from 'react';
import { useReleaseData } from '../hooks/useReleaseData';
import { Calendar, Clock, Plus, Trash2, Target, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';

const InitiativeLiveStatus = () => {
    const { data, updateInitiativeMeta, addDeliverable, updateDeliverable, deleteDeliverable } = useReleaseData();
    const initiative = data?.Initiative || {};
    const [isAdding, setIsAdding] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [newDeliverableName, setNewDeliverableName] = useState('');
    const [newDeliverableDate, setNewDeliverableDate] = useState('');

    const handleAddDeliverable = (e) => {
        if (e) e.preventDefault();
        if (!newDeliverableName) return;

        addDeliverable({
            name: newDeliverableName,
            date: newDeliverableDate || '',
            status: 'pending'
        });

        setNewDeliverableName('');
        setNewDeliverableDate('');
        setIsAdding(false);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-bold text-slate-800 dark:text-slate-100">Initiative Live Status</h2>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        WEEKLY SYNC VIEW
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-medium">{isExpanded ? 'Collapse' : 'Expand'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {isExpanded && (
                <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Column 1: Overall Status & Focus */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1 underline decoration-slate-200 underline-offset-4">Overall Status</label>
                            <select
                                value={initiative.Status || 'Initiative Planning'}
                                onChange={(e) => updateInitiativeMeta('Status', e.target.value)}
                                className={`w-full p-2.5 rounded-xl border-2 font-black text-sm transition-all focus:ring-4 focus:ring-ss-primary/10 outline-none ${initiative.Status === 'Initiative Planning' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                    initiative.Status === 'Release Planning' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                        initiative.Status === 'Development' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                            initiative.Status === 'Released' ? 'bg-green-50 text-green-700 border-green-300' :
                                                'bg-slate-50 text-slate-700 border-slate-300'
                                    }`}
                            >
                                <option value="Initiative Planning">Initiative Planning</option>
                                <option value="Release Planning">Release Planning</option>
                                <option value="Development">Development</option>
                                <option value="Released">Released</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1 underline decoration-slate-200 underline-offset-4">Current Focus / Detailed Status</label>
                            <textarea
                                value={initiative.detailedStatus || ''}
                                onChange={(e) => updateInitiativeMeta('detailedStatus', e.target.value)}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 text-sm italic text-slate-700 bg-slate-50/30 min-h-[140px] outline-none focus:border-ss-primary/50 focus:bg-white transition-all resize-none shadow-sm"
                                placeholder="Type a quick summary..."
                            />
                        </div>

                        <div className="bg-red-50/50 rounded-xl p-5 border-2 border-slate-900 border-dashed mt-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Sync Reminder</span>
                            </div>
                            <p className="text-xs text-red-700 font-black leading-relaxed">
                                Ensure all release plans below align with these primary target dates.
                            </p>
                        </div>
                    </div>

                    {/* Column 2: Deliverables & Milestones */}
                    <div className="flex flex-col gap-4 border-l border-slate-100 lg:pl-8">
                        <div className="flex justify-between items-center px-1 mb-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Next Deliverables & Milestones
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold">{initiative.deliverables?.length || 0}</span>
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
                                <form onSubmit={handleAddDeliverable} className="bg-ss-navy/5 p-4 rounded-2xl border-2 border-ss-navy/10 flex items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex-1">
                                        <input
                                            autoFocus
                                            value={newDeliverableName}
                                            onChange={(e) => setNewDeliverableName(e.target.value)}
                                            placeholder="What needs to be done?"
                                            className="w-full text-sm p-2.5 rounded-lg border-2 border-slate-200 bg-white outline-none focus:border-ss-primary transition-all font-bold text-ss-navy"
                                        />
                                    </div>
                                    <div className="w-36">
                                        <input
                                            type="date"
                                            value={newDeliverableDate}
                                            onChange={(e) => setNewDeliverableDate(e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border-2 border-slate-200 bg-white text-ss-navy outline-none focus:border-ss-primary transition-all font-black"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newDeliverableName}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!newDeliverableName
                                                ? 'bg-slate-200 border-2 border-slate-200'
                                                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={!newDeliverableName ? '#94a3b8' : 'white'}
                                                className="w-5 h-5"
                                            >
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border-2 border-slate-200 text-slate-400 hover:text-slate-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="flex flex-col gap-3">
                                {/* Headers */}
                                <div className="flex items-center gap-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                                    <div className="w-8"></div>
                                    <div className="flex-1">TASK / DELIVERABLE</div>
                                    <div className="w-36 text-center">DUE DATE</div>
                                    <div className="w-10 text-center">DEL</div>
                                </div>

                                {/* List */}
                                <div className="max-h-[500px] overflow-auto flex flex-col gap-3 pr-1 custom-scrollbar">
                                    {[...(initiative.deliverables || [])].sort((a, b) => {
                                        if (!a.date) return 1;
                                        if (!b.date) return -1;
                                        return new Date(a.date) - new Date(b.date);
                                    }).map((del) => (
                                        <div key={del.id} className={`group bg-white border border-slate-100 p-2.5 rounded-xl flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all ${del.status === 'done' ? 'bg-slate-50/50' : ''}`}>
                                            <button
                                                onClick={() => updateDeliverable(del.id, { status: del.status === 'done' ? 'pending' : 'done' })}
                                                className={`w-7 h-7 max-w-[28px] max-h-[28px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${del.status === 'done'
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'bg-white border-slate-400 text-transparent hover:border-slate-500'
                                                    }`}
                                                style={{ aspectRatio: '1/1', padding: '0' }}
                                            >
                                                <Check className={`w-4 h-4 stroke-[3px]`} />
                                            </button>

                                            <div className="flex-1">
                                                <input
                                                    value={del.name}
                                                    onChange={(e) => updateDeliverable(del.id, { name: e.target.value })}
                                                    className={`w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none ${del.status === 'done' ? 'text-slate-400 line-through italic' : 'text-ss-navy'}`}
                                                    placeholder="Deliverable name..."
                                                />
                                            </div>

                                            <div className="w-36 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border-2 border-slate-100 group-hover:border-slate-300 transition-colors">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <input
                                                    type="date"
                                                    value={del.date || ''}
                                                    onChange={(e) => updateDeliverable(del.id, { date: e.target.value })}
                                                    className="bg-transparent border-none p-0 text-[11px] font-black text-ss-navy focus:ring-0 outline-none cursor-pointer w-full text-center"
                                                />
                                            </div>

                                            <div className="w-10 flex justify-center">
                                                <button
                                                    onClick={() => deleteDeliverable(del.id)}
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
            )}
        </div>
    );
};

export default InitiativeLiveStatus;