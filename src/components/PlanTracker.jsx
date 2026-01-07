import React, { useState } from 'react';
import { useReleaseData } from '../hooks/useReleaseData';
import { Calendar, CheckCircle2, Clock, Link as LinkIcon, Figma, FileText, ChevronDown, ChevronRight, Plus, Layers, Target, Info } from 'lucide-react';
import AddReleaseModal from './AddReleaseModal';
import AddEpicModal from './AddEpicModal';

const getStatusColor = (status) => {
    switch (status) {
        case 'Done':
        case 'Released':
            return 'bg-green-100 text-green-700 focus:ring-green-400';
        case 'Pending':
            return 'bg-slate-100 text-slate-600 focus:ring-slate-400';
        case 'Planning':
        case 'Release plan planning':
            return 'bg-blue-100 text-blue-700 focus:ring-blue-400';
        case 'Ready for review':
            return 'bg-purple-100 text-purple-700 focus:ring-purple-400';
        case 'Ready for dev':
            return 'bg-indigo-100 text-indigo-700 focus:ring-indigo-400';
        case 'Dev':
            return 'bg-amber-100 text-amber-700 focus:ring-amber-400';
        case 'PRD':
            return 'bg-orange-100 text-orange-700 focus:ring-orange-400';
        case 'Solutioning':
            return 'bg-pink-100 text-pink-700 focus:ring-pink-400';
        default:
            return 'bg-slate-100 text-slate-600 focus:ring-slate-400';
    }
};

const PlanningGuidelines = () => {
    const [isOpen, setIsOpen] = useState(false);

    const guidelines = [
        { type: 'Initiative from scratch', problem: '1 month', prd: '2 weeks', solutioning: '3-4 weeks', releasePlan: '2-3 weeks', total: '3 months' },
        { type: 'Capability from scratch', problem: '2 weeks', prd: '2 weeks', solutioning: '2-3 weeks', releasePlan: '2 weeks', total: '2 months' },
        { type: 'Parked initiative/capability', problem: '1-2 weeks', prd: '2-3 days', solutioning: '1 week', releasePlan: '1 week', total: '2-4 weeks' },
        { type: 'Existing capability - usability enhancements', problem: '2-5 days', prd: '2-3 days', solutioning: '1 week', releasePlan: '2-5 days', total: '2-3.5 weeks' },
        { type: 'Existing capability - functionality enhancements', problem: '2-5 days', prd: '1 week', solutioning: '1-2 weeks', releasePlan: '2-5 days', total: '2-5 weeks' },
        { type: 'Existing capability - expansion to additional', problem: '1-2 days', prd: '1-2 days', solutioning: '1-2 weeks', releasePlan: '1 week', total: '2-3.5 weeks' },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Planning Guidelines - Time Estimation
                </span>
                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-3 font-bold border-b border-slate-100">Type</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-100 whitespace-nowrap">Understand Problem/Needs</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-100">PRD</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-100">Solutioning</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-100">Release Plan</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-100 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {guidelines.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.type}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.problem}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.prd}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.solutioning}</td>
                                    <td className="px-4 py-3 text-slate-600">{item.releasePlan}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900 text-right">{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const ReleaseProcessGuidelines = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Initial Planning - Release Planning Guidelines
                </span>
                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-6 text-sm text-slate-700 space-y-6 text-left">
                    <div>
                        <h4 className="font-bold text-slate-900 mb-2">Goals:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Break initiative to 2-4 releases</li>
                            <li>Break release 1 to epics with low uncertainty</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-2">Internal steps:</h4>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>PM creates a release plan proposal</li>
                            <li>PM & Ux align R&D - PRD, use-cases, figma (mid fidelity), release plan proposal (note that in many cases R&D was part of the solutioning)</li>
                            <li>
                                Iterate internally (PM, UX, R&D) and with stakeholders (field) to close gaps
                                <ul className="list-[circle] pl-5 mt-1 space-y-1 text-slate-600">
                                    <li>R&D should lower uncertainty: technological risks, bottlenecks, infrastructure changes, etc.</li>
                                    <li>R&D should build a high-level work plan for 4-5 weeks of 3-4 people</li>
                                    <li>UX should clarify figma questions, mainly re components</li>
                                </ul>
                            </li>
                            <li>PM and R&D lead (will be named by activity) come up with epics for the release 1</li>
                        </ol>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                        <p className="font-medium text-amber-800">Note:</p>
                        <p className="text-amber-700">An implicit goal of this step is to avoid descoping during the planning phase. This should be achieved by reducing uncertainty and allocating a reasonable buffer.</p>
                    </div>
                </div>
            )}
        </div>
    );
};



const DetailedPlanningGuidelines = () => {
    const [isOpen, setIsOpen] = useState(false);

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

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Detailed Planning Guidelines - 2 Weeks
                </span>
                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-4 overflow-x-auto text-left">
                    <div className="mb-4 text-sm text-slate-600">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Duration:</strong> 2 weeks</li>
                            <li><strong>Participants:</strong> Product, UX, R&D</li>
                            <li>In brackets: recommended days</li>
                        </ul>
                    </div>

                    <table className="w-full text-xs text-left border border-slate-200">
                        <thead className="bg-slate-800 text-slate-200 uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-r border-slate-700 w-10 text-center">Step</th>
                                <th className="px-3 py-2 border-r border-slate-700 w-16 text-center">By</th>
                                <th className="px-3 py-2 border-r border-slate-700">Activity</th>
                                <th className="px-3 py-2 border-r border-slate-700 w-32">Net time</th>
                                <th className="px-3 py-2">Output</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {steps.map((step) => (
                                <tr key={step.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 border-r border-slate-100 text-center font-medium bg-slate-50">{step.id}</td>
                                    <td className="px-3 py-2 border-r border-slate-100 text-center font-medium">{step.by}</td>
                                    <td className="px-3 py-2 border-r border-slate-100 whitespace-pre-wrap">{step.activity}</td>
                                    <td className="px-3 py-2 border-r border-slate-100">{step.time}</td>
                                    <td className="px-3 py-2 font-medium text-slate-800">{step.output}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 italic">
                        During this phase, items that require more time than expected (from Initial Planning) either consume the buffer or require hacks by R&D (and added to the technical debt bucket).
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components for Initial Planning View ---

const PlanningStepCard = ({ step, toggleStatus }) => {

    const getOwnerColor = (owner) => {
        if (!owner) return 'bg-slate-50 text-slate-600 border-slate-200';
        if (owner.includes('All Teams')) return 'bg-teal-50 text-teal-700 border-teal-200';
        if (owner.includes('R&D')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (owner.includes('PM') || owner.includes('UX')) return 'bg-rose-50 text-rose-700 border-rose-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    return (
        <div className={`p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all bg-white mb-3 flex items-start gap-4 ${step.status === 'completed' ? 'border-green-500 opacity-75' : 'border-blue-500'}`}>
            <button
                onClick={() => toggleStatus(step.id)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-500'}`}
            >
                <CheckCircle2 className="w-4 h-4" />
            </button>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className={`font-semibold text-slate-900 ${step.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {step.activity}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${getOwnerColor(step.owner)}`}>
                        {step.owner}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Est: {step.expectedDuration}
                    </span>
                    {step.actualDuration && (
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                            Actual: {step.actualDuration}
                        </span>
                    )}
                    {step.dateCompleted && (
                        <span className="flex items-center gap-1.5 text-green-600">
                            <Calendar className="w-4 h-4" />
                            {step.dateCompleted}
                        </span>
                    )}
                </div>

                {step.artifact && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Output: <span className="font-medium">{step.artifact}</span></span>
                    </div>
                )}
            </div>
        </div>
    );
};

const InitialPlanningView = ({ data, updateInitialPlanning }) => {
    const planning = data.Initiative?.InitialPlanning || {};

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Planning Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
                        <input
                            type="date"
                            value={planning.StartDate || ''}
                            onChange={(e) => updateInitialPlanning('StartDate', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Planned End Date</label>
                        <input
                            type="date"
                            value={planning.PlannedEndDate || ''}
                            onChange={(e) => updateInitialPlanning('PlannedEndDate', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</label>
                        <select
                            value={planning.Status || ''}
                            onChange={(e) => updateInitialPlanning('Status', e.target.value)}
                            className={`w-full px-2 py-1 border border-slate-200 rounded outline-none text-sm font-medium focus:ring-2 ${getStatusColor(planning.Status)}`}
                        >
                            <option value="">Select Status</option>
                            <option value="PRD">PRD</option>
                            <option value="Solutioning">Solutioning</option>
                            <option value="Release plan planning">Release plan planning</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">PRD Link</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="url"
                                value={planning.PRD || ''}
                                onChange={(e) => updateInitialPlanning('PRD', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary"
                            />
                            {planning.PRD && (
                                <a href={planning.PRD} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                                    <LinkIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Figma Link</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="url"
                                value={planning.Figma || ''}
                                onChange={(e) => updateInitialPlanning('Figma', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary"
                            />
                            {planning.Figma && (
                                <a href={planning.Figma} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                                    <LinkIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Release Plan Doc</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="url"
                                value={planning.ReleasePlanSummary || ''}
                                onChange={(e) => updateInitialPlanning('ReleasePlanSummary', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary"
                            />
                            {planning.ReleasePlanSummary && (
                                <a href={planning.ReleasePlanSummary} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                                    <LinkIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PlanningGuidelines />
            <ReleaseProcessGuidelines />
        </div>
    );
};

// --- Sub-components for Release Plans View ---

const EpicRow = ({ epic, planIndex, epicIndex, updateEpic }) => (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 text-xs">
        <td className="px-3 py-2">
            <input
                value={epic.Name || ''}
                onChange={(e) => updateEpic(planIndex, epicIndex, 'Name', e.target.value)}
                className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full font-semibold text-slate-900"
                placeholder="Epic Name"
                title={epic.Name}
            />
        </td>
        <td className="px-3 py-2">
            <textarea
                value={epic.description || ''}
                onChange={(e) => updateEpic(planIndex, epicIndex, 'description', e.target.value)}
                className="bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none w-full min-h-[40px] p-1 rounded resize-none"
                placeholder="Description..."
                title={epic.description}
            />
        </td>
        <td className="px-3 py-2 text-center">
            <input
                value={epic.loe || ''}
                onChange={(e) => updateEpic(planIndex, epicIndex, 'loe', e.target.value)}
                className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-12 text-center"
                placeholder="W"
            />
        </td>
        <td className="px-3 py-2">
            <div className="flex items-center gap-1">
                <input
                    value={epic.figma || ''}
                    onChange={(e) => updateEpic(planIndex, epicIndex, 'figma', e.target.value)}
                    className="bg-transparent border-b border-transparent focus:border-ss-primary focus:outline-none flex-1 text-ss-primary text-xs"
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
    </tr>
);

const ReleasePlanGroup = ({ plan, planIndex, updateReleasePlan, updateEpic, onAddEpic }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-slate-50 border-b border-slate-100">
                <div
                    className="px-6 py-4 flex flex-col gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Header Top Row: Title & Status */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </div>
                            <input
                                value={plan.goal}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateReleasePlan(planIndex, 'goal', e.target.value)}
                                className="bg-transparent text-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 border border-transparent focus:border-blue-200 outline-none transition-all w-full max-w-2xl placeholder:text-slate-300"
                                placeholder="Release Goal"
                                title={plan.goal}
                            />
                        </div>
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <select
                                value={plan.status}
                                onChange={(e) => updateReleasePlan(planIndex, 'status', e.target.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-none outline-none cursor-pointer focus:ring-2 ${getStatusColor(plan.status)}`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Planning">Planning</option>
                                <option value="Dev">Dev</option>
                                <option value="Released">Released</option>
                            </select>
                        </div>
                    </div>

                    {/* Header Bottom Row: Metrics Grid */}
                    {isExpanded && (
                        <div className="pl-9 grid grid-cols-2 md:grid-cols-4 gap-4" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> LOE (Weeks)
                                </label>
                                <input
                                    value={plan.loe}
                                    onChange={(e) => updateReleasePlan(planIndex, 'loe', e.target.value)}
                                    className="font-semibold text-slate-700 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="e.g. 4"
                                />
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Layers className="w-3 h-3" /> Developers
                                </label>
                                <input
                                    value={plan.devs}
                                    onChange={(e) => updateReleasePlan(planIndex, 'devs', e.target.value)}
                                    className="font-semibold text-slate-700 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="e.g. 3"
                                />
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" /> KPI / Goal
                                </label>
                                <input
                                    value={plan.kpi}
                                    onChange={(e) => updateReleasePlan(planIndex, 'kpi', e.target.value)}
                                    className="font-semibold text-slate-700 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="e.g. +10% Conv."
                                />
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" /> Requirements
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        value={plan.reqDoc}
                                        onChange={(e) => updateReleasePlan(planIndex, 'reqDoc', e.target.value)}
                                        className="font-semibold text-blue-600 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal truncate"
                                        placeholder="Paste Link..."
                                    />
                                    {plan.reqDoc && (
                                        <a href={plan.reqDoc} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                                            <LinkIcon className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-200">
                    {(!plan.Epics || plan.Epics.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                <Target className="w-6 h-6 text-slate-300" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">No Epics Defined</h4>
                            <p className="text-xs text-slate-500 max-w-xs mb-4">Start breaking down this release into actionable epics.</p>
                            <button
                                onClick={() => onAddEpic(planIndex)}
                                className="text-blue-600 text-xs font-bold hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Add First Epic
                            </button>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-bold tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 w-[20%]">Epic</th>
                                        <th className="px-3 py-2 w-[25%]">Description</th>
                                        <th className="px-3 py-2 w-[10%] text-center">LOE</th>
                                        <th className="px-3 py-2 w-[15%]">Figma</th>
                                        <th className="px-3 py-2 w-[15%]">Jira</th>
                                        <th className="px-3 py-2 w-[15%]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {plan.Epics.map((epic, idx) => (
                                        <EpicRow key={idx} epic={epic} planIndex={planIndex} epicIndex={idx} updateEpic={updateEpic} />
                                    ))}
                                </tbody>
                            </table>
                            <div className="bg-slate-50/30 p-2 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => onAddEpic(planIndex)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2 text-xs"
                                >
                                    <Plus className="w-3 h-3" /> Add Epic
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ReleasePlansView = ({ data, updateReleasePlan, addReleasePlan, updateEpic, addEpic }) => {
    const releasePlans = data.Initiative?.ReleasePlan || [];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
    const [activePlanIndex, setActivePlanIndex] = useState(null);

    const handleAddEpicClick = (planIndex) => {
        setActivePlanIndex(planIndex);
        setIsEpicModalOpen(true);
    };

    const handleEpicSubmit = async (name) => {
        if (activePlanIndex !== null) {
            await addEpic(activePlanIndex, name);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Release Plans Breakdown</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Release
                </button>
            </div>

            <DetailedPlanningGuidelines />

            {
                releasePlans.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No Releases Defined</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Define your release groups and break them down into technical epics.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Release
                        </button>
                    </div>
                ) : (
                    releasePlans.map((plan, idx) => (
                        <ReleasePlanGroup
                            key={plan.id || idx}
                            plan={plan}
                            planIndex={idx}
                            updateReleasePlan={updateReleasePlan}
                            updateEpic={updateEpic}
                            onAddEpic={handleAddEpicClick}
                        />
                    ))
                )
            }


            <AddReleaseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={addReleasePlan}
            />

            <AddEpicModal
                isOpen={isEpicModalOpen}
                onClose={() => setIsEpicModalOpen(false)}
                onSubmit={handleEpicSubmit}
            />
        </div >
    );
};

// --- Main Tracker Component ---

const PlanTracker = ({ activeView }) => {
    const { data, isLoading, updatePlanningStep, updateInitialPlanning, updateReleasePlan, addReleasePlan, updateEpic, addEpic } = useReleaseData();

    if (isLoading || !data) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-white rounded-xl border border-slate-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 font-medium">Loading Plan Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {data.isUsingDefault && (
                <div className="bg-amber-50 border-b border-amber-200 p-2 text-center text-xs text-amber-800 mb-6 rounded-xl">
                    <strong>Note:</strong> Showing demo data. Configure <code>SHEET_ID</code> in <code>src/services/googleSheets.js</code> to connect your data.
                </div>
            )}

            {(activeView === 'initial_planning' || !activeView) && (
                <InitialPlanningView data={data} updateInitialPlanning={updateInitialPlanning} />
            )}

            {activeView === 'release_plans' && (
                <ReleasePlansView
                    data={data}
                    updateStep={updatePlanningStep}
                    updateReleasePlan={updateReleasePlan}
                    addReleasePlan={addReleasePlan}
                    updateEpic={updateEpic}
                    addEpic={addEpic}
                />
            )}
        </div>
    );
};

export default PlanTracker;
