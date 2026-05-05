import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Layers, X } from 'lucide-react';
import { useInitiativesList } from '../hooks/queries/useInitiatives';

const MoveReleaseModal = ({ isOpen, onClose, onSubmit, currentInitiativeId, releaseGoal }) => {
    const [selectedId, setSelectedId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { data: initiatives, isLoading } = useInitiativesList();

    useEffect(() => {
        if (!isOpen) {
            setSelectedId('');
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const targets = useMemo(
        () => (initiatives || []).filter((i) => i.id !== currentInitiativeId && !i.isArchived),
        [initiatives, currentInitiativeId]
    );

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        const target = targets.find((t) => t.id === selectedId);
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(selectedId, target?.name);
            onClose();
        } catch (err) {
            console.error('Failed to move release:', err);
            setError(err.message || 'Failed to move release. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Move Release</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                            Move to Initiative
                        </label>
                        {releaseGoal && (
                            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">{releaseGoal}</span> and its epics will be moved.
                            </p>
                        )}
                        {isLoading ? (
                            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Loading initiatives…</div>
                        ) : targets.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                No other initiatives are available to move this release into.
                            </div>
                        ) : (
                            <select
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                                autoFocus
                                disabled={isSubmitting}
                            >
                                <option value="">Select an initiative…</option>
                                {targets.map((init) => (
                                    <option key={init.id} value={init.id}>{init.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-2 border-t border-slate-50 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedId || isSubmitting}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Moving…
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4" />
                                    Move
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MoveReleaseModal;
