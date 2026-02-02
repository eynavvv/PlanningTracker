import { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Layers, FileText, Target, Plus, Link as LinkIcon, Info, Trash2, ExternalLink, X } from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';
import { EpicRow } from './EpicRow';

interface Epic {
  Name?: string;
  description?: string;
  loe?: string;
  figma?: string;
  Link?: string;
  Status?: string;
}

interface ReleasePlan {
  id: string;
  goal: string;
  status: string;
  devs: string;
  devPlan: string;
  reqDoc: string;
  prePlanningStartDate: string;
  prePlanningEndDate: string;
  planningStartDate: string;
  planningEndDate: string;
  devStartDate: string;
  devEndDate: string;
  qaEventDate: string;
  externalReleaseDate: string;
  Epics?: Epic[];
}

interface ReleasePlanGroupProps {
  plan: ReleasePlan;
  planIndex: number;
  updateReleasePlan: (planIndex: number, field: string, value: string) => void;
  onDeleteReleasePlan: (planIndex: number) => void;
  updateEpic: (planIndex: number, epicIndex: number, field: string, value: string) => void;
  onDeleteEpic: (planIndex: number, epicIndex: number) => void;
  onAddEpic: (planIndex: number) => void;
}

export function ReleasePlanGroup({
  plan,
  planIndex,
  updateReleasePlan,
  onDeleteReleasePlan,
  updateEpic,
  onDeleteEpic,
  onAddEpic,
}: ReleasePlanGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showIframe, setShowIframe] = useState(true);
  const [showReqDocIframe, setShowReqDocIframe] = useState(false);

  return (
    <div id={`release-${plan.id}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8 scroll-mt-24">
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
        <div
          className="px-6 py-4 flex flex-col gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header Top Row: Title & Status */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 transition-colors">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
              <input
                value={plan.goal}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateReleasePlan(planIndex, 'goal', e.target.value)}
                className="bg-transparent text-xl font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 border border-transparent focus:border-blue-200 outline-none transition-all w-full max-w-2xl placeholder:text-slate-300"
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
                <option value="Pre-Planning">Pre-Planning</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Released">Released</option>
              </select>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteReleasePlan(planIndex);
                }}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete Release Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Header Bottom Row: Metrics Grid & Dates */}
          {isExpanded && (
            <div className="pl-9 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Developers
                  </label>
                  <input
                    value={plan.devs}
                    onChange={(e) => updateReleasePlan(planIndex, 'devs', e.target.value)}
                    className="font-semibold text-slate-700 dark:text-slate-200 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal bg-transparent"
                    placeholder="e.g. 3"
                  />
                </div>
                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Dev Plan
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      value={plan.devPlan}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('<iframe') && val.includes('src=')) {
                          const match = val.match(/src=['"]([^'"]+)['"]/);
                          if (match && match[1]) val = match[1];
                        }
                        updateReleasePlan(planIndex, 'devPlan', val);
                      }}
                      className="font-semibold text-blue-600 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal truncate bg-transparent"
                      placeholder="Paste Jira Plan Link..."
                    />
                    {plan.devPlan && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIframe(!showIframe);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${showIframe ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        title="Toggle Live Preview"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {plan.devPlan && (
                      <a href={plan.devPlan} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                        <LinkIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Requirements
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      value={plan.reqDoc}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Extract src from iframe tag if pasted
                        if (val.includes('<iframe') && val.includes('src=')) {
                          const match = val.match(/src=['"]([^'"]+)['"]/);
                          if (match && match[1]) val = match[1];
                        }
                        updateReleasePlan(planIndex, 'reqDoc', val);
                      }}
                      className="font-semibold text-blue-600 w-full outline-none text-sm placeholder:text-slate-300 placeholder:font-normal truncate bg-transparent"
                      placeholder="Paste Link or iframe..."
                    />
                    {plan.reqDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReqDocIframe(!showReqDocIframe);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${showReqDocIframe ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        title="Toggle Document Preview"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {plan.reqDoc && (
                      <a href={plan.reqDoc} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                        <LinkIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_1.2fr_0.7fr_0.7fr] gap-4">
                <div className="bg-cyan-50/30 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-100 dark:border-cyan-800 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Pre-Planning Phase
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                      <input
                        type="date"
                        value={plan.prePlanningStartDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'prePlanningStartDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">End</span>
                      <input
                        type="date"
                        value={plan.prePlanningEndDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'prePlanningEndDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/30 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Release Planning Phase
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                      <input
                        type="date"
                        value={plan.planningStartDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'planningStartDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">End</span>
                      <input
                        type="date"
                        value={plan.planningEndDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'planningEndDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/30 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Release Development Phase
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                      <input
                        type="date"
                        value={plan.devStartDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'devStartDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">End</span>
                      <input
                        type="date"
                        value={plan.devEndDate || ''}
                        onChange={(e) => updateReleasePlan(planIndex, 'devEndDate', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/30 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> QA Event
                  </label>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Date</span>
                    <input
                      type="date"
                      value={plan.qaEventDate || ''}
                      onChange={(e) => updateReleasePlan(planIndex, 'qaEventDate', e.target.value)}
                      className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-ss-navy/5 dark:bg-slate-700/50 p-3 rounded-lg border border-ss-navy/10 dark:border-slate-600 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-ss-navy dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Target Release
                  </label>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Date</span>
                    <input
                      type="date"
                      value={plan.externalReleaseDate || ''}
                      onChange={(e) => updateReleasePlan(planIndex, 'externalReleaseDate', e.target.value)}
                      className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-ss-navy/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isExpanded && showIframe && plan.devPlan && (
            <div className="mx-6 mb-6 mt-2 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Layers className="w-3 h-3 text-blue-600" />
                  Jira Live Timeline Preview
                </span>
                <button
                  onClick={() => setShowIframe(false)}
                  className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full aspect-video min-h-[500px]">
                {!plan.devPlan.includes('PlanEmbeddedReport.jspa') ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
                      <Info className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Standard Link Detected</h4>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                      Atlassian security prevents standard Jira links from being embedded. To see the live timeline here, you must use the <strong>"Share {'->'} Embed"</strong> link from Jira.
                    </p>
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-left text-sm space-y-3 shadow-sm">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">How to get the correct link:</p>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                        <li>Open your Plan in Jira</li>
                        <li>Click the <strong>"Share"</strong> button (top right)</li>
                        <li>Select <strong>"Embed"</strong> or <strong>"Embedded report"</strong></li>
                        <li>Copy the <code>src</code> URL or the entire <code>{'<iframe>'}</code> tag and paste it here.</li>
                      </ol>
                    </div>
                    <a
                      href={plan.devPlan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2"
                    >
                      Open Plan in New Tab <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={plan.devPlan}
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    style={{ border: 'none' }}
                    title="Jira Plan"
                    loading="lazy"
                  ></iframe>
                )}
              </div>
            </div>
          )}

          {isExpanded && showReqDocIframe && plan.reqDoc && (
            <div className="mx-6 mb-6 mt-2 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  Requirements Document Preview
                </span>
                <button
                  onClick={() => setShowReqDocIframe(false)}
                  className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full min-h-[600px]">
                {(() => {
                  // Check if it's an embeddable URL (Google Docs, Notion, Zoom, etc.)
                  const isGoogleDoc = plan.reqDoc.includes('docs.google.com') || plan.reqDoc.includes('drive.google.com');
                  const isNotion = plan.reqDoc.includes('notion.so') || plan.reqDoc.includes('notion.site');
                  const isConfluence = plan.reqDoc.includes('atlassian.net/wiki') || plan.reqDoc.includes('confluence');
                  const isFigma = plan.reqDoc.includes('figma.com');
                  const isZoom = plan.reqDoc.includes('zoom.us');
                  const isMiro = plan.reqDoc.includes('miro.com');

                  // Convert Google Docs URL to embed format if needed
                  let embedUrl = plan.reqDoc;
                  if (isGoogleDoc && !plan.reqDoc.includes('/embed') && !plan.reqDoc.includes('/preview')) {
                    // Convert /edit or /view to /preview for embedding
                    embedUrl = plan.reqDoc
                      .replace('/edit', '/preview')
                      .replace('/view', '/preview');
                    if (!embedUrl.includes('/preview')) {
                      embedUrl = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'embedded=true';
                    }
                  }

                  // For Figma, convert to embed URL
                  if (isFigma && !plan.reqDoc.includes('embed')) {
                    embedUrl = plan.reqDoc.replace('figma.com/file', 'figma.com/embed?embed_host=share&url=' + encodeURIComponent(plan.reqDoc));
                  }

                  // Check if it's an embeddable URL
                  const isEmbeddable = isGoogleDoc || isNotion || isConfluence || isFigma || isZoom || isMiro;

                  if (isEmbeddable) {
                    return (
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        className="absolute inset-0"
                        style={{ border: 'none', minHeight: '600px' }}
                        title="Requirements Document"
                        loading="lazy"
                        allow="fullscreen"
                        allowFullScreen
                      ></iframe>
                    );
                  }

                  // For other URLs, show a message with link
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Document Preview</h4>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                        This document type may not support embedding. For best results, use Google Docs, Notion, Confluence, Figma, Zoom Whiteboard, or Miro links.
                      </p>
                      <a
                        href={plan.reqDoc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                      >
                        Open Document <LinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Epics section - hidden as per original code */}
      {false && isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          {(!plan.Epics || (plan.Epics?.length ?? 0) === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-slate-300" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No Epics Defined</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">Start breaking down this release into actionable epics.</p>
              <button
                onClick={() => onAddEpic(planIndex)}
                className="text-blue-600 text-xs font-bold hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add First Epic
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 uppercase text-[9px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 w-[20%]">Epic</th>
                    <th className="px-3 py-2 w-[25%]">Description</th>
                    <th className="px-3 py-2 w-[10%] text-center">LOE</th>
                    <th className="px-3 py-2 w-[15%]">Figma</th>
                    <th className="px-3 py-2 w-[15%]">Jira</th>
                    <th className="px-3 py-2 w-[15%]">Status</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {plan.Epics?.map((epic, idx) => (
                    <EpicRow
                      key={idx}
                      epic={epic}
                      planIndex={planIndex}
                      epicIndex={idx}
                      updateEpic={updateEpic}
                      deleteEpic={onDeleteEpic}
                    />
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50/30 dark:bg-slate-800/30 p-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
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
}
