import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Layers } from 'lucide-react';
import PlanTracker from '../components/PlanTracker';
import { ReleaseProvider, useReleaseData } from '../hooks/useReleaseData';

const PlanHeader = () => {
    const { data, isSyncing } = useReleaseData();
    const meta = data?.Initiative || {};

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-ss-navy">{meta.Name || 'Loading...'}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-ss-primary text-xs font-bold uppercase tracking-wide">
                                    {meta.Status || 'Draft'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                <span>PM: {meta.PM}</span>
                                <span>•</span>
                                <span>UX: {meta.UX}</span>
                                <span>•</span>
                                <span>Group: {meta.Group}</span>
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

const PlanDetail = () => {
    const { id } = useParams();
    const [activeView, setActiveView] = useState('initial_planning'); // 'initial_planning' or 'release_plans'

    return (
        <ReleaseProvider planId={decodeURIComponent(id)}>
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <PlanHeader />

                {/* View Switcher Tabs */}
                <div className="bg-white border-b border-slate-200 px-6">
                    <div className="max-w-[1600px] mx-auto flex gap-4 py-4">
                        <button
                            onClick={() => setActiveView('initial_planning')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'initial_planning'
                                ? 'bg-ss-navy text-white shadow-md ring-1 ring-ss-navy'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                } `}
                        >
                            <Clock className={`w-4 h-4 ${activeView === 'initial_planning' ? 'text-slate-400' : 'text-slate-400'}`} />
                            Initial Planning
                        </button>
                        <button
                            onClick={() => setActiveView('release_plans')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'release_plans'
                                ? 'bg-ss-navy text-white shadow-md ring-1 ring-ss-navy'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                } `}
                        >
                            <Layers className={`w-4 h-4 ${activeView === 'release_plans' ? 'text-ss-primary' : 'text-slate-400'}`} />
                            Release Plans
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="max-w-[1600px] mx-auto p-6">
                        <PlanTracker activeView={activeView} />
                    </div>
                </div>
            </div>
        </ReleaseProvider>
    );
};

export default PlanDetail;
