import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Layers } from 'lucide-react';
import PlanTracker from '../components/PlanTracker';
import { ReleaseProvider, useReleaseData } from '../hooks/useReleaseData';
import InitiativeLiveStatus from '../components/InitiativeLiveStatus';
import { PlanDetailSkeleton } from '../components/skeletons';

const PlanHeader = () => {
    const { data, isSyncing, updateInitiativeMeta } = useReleaseData();
    const meta = data?.Initiative || {};

    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <input
                                    value={meta.Name || ''}
                                    onChange={(e) => updateInitiativeMeta('Name', e.target.value)}
                                    className="text-xl font-bold text-ss-navy dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all px-1 rounded-sm min-w-[300px]"
                                    placeholder="Enter Initiative Name..."
                                />
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${meta.Status === 'Initiative Planning' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                                    meta.Status === 'Release Planning' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' :
                                        meta.Status === 'Development' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                            meta.Status === 'Released' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                                    }`}>
                                    {meta.Status || 'Draft'}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 mt-2 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-400">PM:</span>
                                    <input
                                        value={meta.PM || ''}
                                        onChange={(e) => updateInitiativeMeta('PM', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all px-1 rounded-sm w-32 font-medium text-slate-700 dark:text-slate-300"
                                        placeholder="Add PM..."
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-400">UX:</span>
                                    <input
                                        value={meta.UX || ''}
                                        onChange={(e) => updateInitiativeMeta('UX', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all px-1 rounded-sm w-32 font-medium text-slate-700 dark:text-slate-300"
                                        placeholder="Add UX..."
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-400">Tech Lead:</span>
                                    <input
                                        value={meta.TechLead || ''}
                                        onChange={(e) => updateInitiativeMeta('TechLead', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all px-1 rounded-sm w-32 font-medium text-slate-700 dark:text-slate-300"
                                        placeholder="Add Tech Lead..."
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-400">Group:</span>
                                    <select
                                        value={meta.Group || ''}
                                        onChange={(e) => updateInitiativeMeta('Group', e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all px-1 rounded-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        <option value="">Select Group</option>
                                        <option value="Pegasus">Pegasus</option>
                                        <option value="Zebra">Zebra</option>
                                        <option value="Dolphin">Dolphin</option>
                                        <option value="Falcon">Falcon</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isSyncing ? (
                            <span className="text-xs text-slate-400 font-medium italic animate-pulse">Syncing...</span>
                        ) : (
                            <span className="text-xs text-green-600 font-medium">All changes saved</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContentWrapper = ({ activeView, setActiveView }) => {
    const { isLoading, error } = useReleaseData();

    if (isLoading) {
        return <PlanDetailSkeleton />;
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl border border-red-100 dark:border-red-800 shadow-sm flex flex-col items-center gap-3">
                    <div className="text-lg font-bold">Something went wrong</div>
                    <div className="text-sm opacity-80">{error}</div>
                    <Link to="/" className="mt-2 text-sm font-bold underline hover:no-underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-inter">
            <PlanHeader />
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1800px] mx-auto p-6">
                    {/* Live Status Section at the Top */}
                    <InitiativeLiveStatus />

                    {/* View Switcher Tabs under it */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 flex gap-1 mb-6 inline-flex shadow-sm">
                        <button
                            onClick={() => setActiveView('initial_planning')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'initial_planning'
                                ? 'bg-ss-navy text-white shadow-md'
                                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                } `}
                        >
                            <Clock className="w-4 h-4" />
                            Initiative Planning
                        </button>
                        <button
                            onClick={() => setActiveView('release_plans')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'release_plans'
                                ? 'bg-ss-navy text-white shadow-md'
                                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                } `}
                        >
                            <Layers className="w-4 h-4" />
                            Release Plans
                        </button>
                    </div>

                    <PlanTracker activeView={activeView} />
                </div>
            </div>
        </div>
    );
};

const PlanDetail = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') || 'initial_planning';
    const [activeView, setActiveView] = useState(initialView);

    useEffect(() => {
        const viewOverride = searchParams.get('view');
        if (viewOverride && viewOverride !== activeView) {
            setActiveView(viewOverride);
        }
    }, [searchParams]);

    return (
        <ReleaseProvider planId={decodeURIComponent(id)}>
            <ContentWrapper activeView={activeView} setActiveView={setActiveView} />
        </ReleaseProvider>
    );
};

export default PlanDetail;
