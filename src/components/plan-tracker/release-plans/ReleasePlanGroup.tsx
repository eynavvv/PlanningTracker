import { useState } from 'react';
import { ChevronDown, ChevronRight, Layers, FileText, Link as LinkIcon, Info, Trash2, ExternalLink, X, Check } from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';

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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type PhaseStatus = 'done' | 'active' | 'upcoming';

function getPhaseStatus(startStr: string | undefined, endStr: string | undefined): PhaseStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!startStr) return 'upcoming';
  const start = new Date(startStr + 'T00:00:00');
  const end = endStr ? new Date(endStr + 'T00:00:00') : null;
  if (end && today > end) return 'done';
  if (today >= start) return 'active';
  return 'upcoming';
}

export function ReleasePlanGroup({
  plan,
  planIndex,
  updateReleasePlan,
  onDeleteReleasePlan,
}: ReleasePlanGroupProps) {
  const [isExpanded, setIsExpanded] = useState(() => !['Pending', 'Ready for Release', 'Released'].includes(plan.status));
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showJiraIframe, setShowJiraIframe] = useState(false);
  const [showReqDocIframe, setShowReqDocIframe] = useState(false);

  const planRecord = plan as unknown as Record<string, string>;

  const renderDateCell = (fieldKey: string, label: string) => {
    const value = planRecord[fieldKey] || '';
    const isEditing = editingField === fieldKey;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">{label}</span>
        {isEditing ? (
          <input
            type="date"
            autoFocus
            value={value}
            onChange={(e) => updateReleasePlan(planIndex, fieldKey, e.target.value)}
            onBlur={() => setEditingField(null)}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded px-1.5 py-0.5 outline-none font-bold text-slate-800 dark:text-slate-100 w-[118px]"
          />
        ) : (
          <span
            onClick={(e) => { e.stopPropagation(); setEditingField(fieldKey); }}
            className={`text-[11px] font-bold cursor-pointer rounded px-1 py-0.5 -mx-1 transition-colors ${
              value
                ? 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                : 'text-slate-300 dark:text-slate-600 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 italic'
            }`}
          >
            {value ? formatDate(value) : '+ Set'}
          </span>
        )}
      </div>
    );
  };

  const prePlanningStatus = getPhaseStatus(plan.prePlanningStartDate, plan.prePlanningEndDate);
  const planningStatus = getPhaseStatus(plan.planningStartDate, plan.planningEndDate);
  const devStatus = getPhaseStatus(plan.devStartDate, plan.devEndDate);
  const qaStatus = getPhaseStatus(plan.qaEventDate, plan.qaEventDate);
  const targetStatus = getPhaseStatus(plan.externalReleaseDate, plan.externalReleaseDate);

  const phaseClass = (status: PhaseStatus, activeClasses: string, upcomingClasses: string) =>
    status === 'done'
      ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
      : status === 'active'
      ? activeClasses
      : upcomingClasses;

  const phaseLabelClass = (status: PhaseStatus, activeColor: string) =>
    status === 'active' ? activeColor : 'text-slate-400';

  return (
    <div id={`release-${plan.id}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8 scroll-mt-24">
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
        <div
          className="px-6 py-4 flex flex-col gap-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header row */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 transition-colors flex-shrink-0">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
              <input
                value={plan.goal}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateReleasePlan(planIndex, 'goal', e.target.value)}
                className="bg-transparent text-xl font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 border border-transparent focus:border-blue-200 outline-none transition-all flex-1 min-w-0 placeholder:text-slate-300"
                placeholder="Release Goal"
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <select
                value={plan.status}
                onChange={(e) => updateReleasePlan(planIndex, 'status', e.target.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-none outline-none cursor-pointer focus:ring-2 ${getStatusColor(plan.status)}`}
              >
                <option value="Pending">Pending</option>
                <option value="Pre-Planning">Pre-Planning</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Ready for Release">Ready for Release</option>
                <option value="Released">Released</option>
              </select>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteReleasePlan(planIndex); }}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete Release Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsed date summary */}
          {!isExpanded && (plan.devStartDate || plan.qaEventDate || plan.externalReleaseDate) && (
            <div className="pl-9 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {plan.devStartDate && (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-100 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  Dev: {formatDate(plan.devStartDate)}{plan.devEndDate ? ` – ${formatDate(plan.devEndDate)}` : ''}
                </span>
              )}
              {plan.qaEventDate && (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold border border-amber-100 dark:border-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  QA: {formatDate(plan.qaEventDate)}
                </span>
              )}
              {plan.externalReleaseDate && (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-2.5 py-1 rounded-full font-bold border border-violet-100 dark:border-violet-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  Target: {formatDate(plan.externalReleaseDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col gap-1.5">
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

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col gap-1.5">
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
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowJiraIframe(!showJiraIframe); }}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${showJiraIframe ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      title="Toggle Live Preview"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <a href={plan.devPlan} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 flex-shrink-0">
                      <LinkIcon className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Requirements
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={plan.reqDoc}
                  onChange={(e) => {
                    let val = e.target.value;
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
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowReqDocIframe(!showReqDocIframe); }}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${showReqDocIframe ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      title="Toggle Document Preview"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <a href={plan.reqDoc} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 flex-shrink-0">
                      <LinkIcon className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Phase timeline flow */}
          <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
            {/* Pre-Planning */}
            <div className={`flex-1 min-w-[130px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${phaseClass(prePlanningStatus, 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm', 'border-cyan-100 dark:border-cyan-900/40 bg-white dark:bg-slate-800')}`}>
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${phaseLabelClass(prePlanningStatus, 'text-cyan-600 dark:text-cyan-400')}`}>Pre-Planning</span>
                {prePlanningStatus === 'done' && <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                {prePlanningStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />}
              </div>
              <div className="flex flex-col gap-1.5">
                {renderDateCell('prePlanningStartDate', 'Start')}
                {renderDateCell('prePlanningEndDate', 'End')}
              </div>
            </div>

            <div className="flex items-center text-slate-200 dark:text-slate-700 flex-shrink-0 self-center">
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Planning */}
            <div className={`flex-1 min-w-[130px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${phaseClass(planningStatus, 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-sm', 'border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-800')}`}>
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${phaseLabelClass(planningStatus, 'text-blue-600 dark:text-blue-400')}`}>Planning</span>
                {planningStatus === 'done' && <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                {planningStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />}
              </div>
              <div className="flex flex-col gap-1.5">
                {renderDateCell('planningStartDate', 'Start')}
                {renderDateCell('planningEndDate', 'End')}
              </div>
            </div>

            <div className="flex items-center text-slate-200 dark:text-slate-700 flex-shrink-0 self-center">
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Development */}
            <div className={`flex-1 min-w-[130px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${phaseClass(devStatus, 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm', 'border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-800')}`}>
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${phaseLabelClass(devStatus, 'text-emerald-600 dark:text-emerald-400')}`}>Development</span>
                {devStatus === 'done' && <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                {devStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />}
              </div>
              <div className="flex flex-col gap-1.5">
                {renderDateCell('devStartDate', 'Start')}
                {renderDateCell('devEndDate', 'End')}
              </div>
            </div>

            <div className="flex items-center text-slate-200 dark:text-slate-700 flex-shrink-0 self-center">
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* QA Event */}
            <div className={`flex-1 min-w-[110px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${phaseClass(qaStatus, 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-sm', 'border-amber-100 dark:border-amber-900/40 bg-white dark:bg-slate-800')}`}>
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${phaseLabelClass(qaStatus, 'text-amber-600 dark:text-amber-400')}`}>QA Event</span>
                {qaStatus === 'done' && <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                {qaStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />}
              </div>
              <div className="flex flex-col gap-1.5">
                {renderDateCell('qaEventDate', 'Date')}
              </div>
            </div>

            <div className="flex items-center text-slate-200 dark:text-slate-700 flex-shrink-0 self-center">
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Target Release */}
            <div className={`flex-1 min-w-[110px] rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${phaseClass(targetStatus, 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 shadow-sm', 'border-violet-100 dark:border-violet-900/40 bg-white dark:bg-slate-800')}`}>
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${phaseLabelClass(targetStatus, 'text-violet-600 dark:text-violet-400')}`}>Target Release</span>
                {targetStatus === 'done' && <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                {targetStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />}
              </div>
              <div className="flex flex-col gap-1.5">
                {renderDateCell('externalReleaseDate', 'Date')}
              </div>
            </div>
          </div>

          {/* Jira iframe */}
          {showJiraIframe && plan.devPlan && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
              <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Layers className="w-3 h-3 text-blue-600" />
                  Jira Live Timeline Preview
                </span>
                <button onClick={() => setShowJiraIframe(false)} className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
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
                    <a href={plan.devPlan} target="_blank" rel="noopener noreferrer" className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2">
                      Open Plan in New Tab <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <iframe src={plan.devPlan} width="100%" height="100%" className="absolute inset-0" style={{ border: 'none' }} title="Jira Plan" loading="lazy" />
                )}
              </div>
            </div>
          )}

          {/* Requirements iframe */}
          {showReqDocIframe && plan.reqDoc && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
              <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  Requirements Document Preview
                </span>
                <button onClick={() => setShowReqDocIframe(false)} className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full min-h-[600px]">
                {(() => {
                  const isGoogleDoc = plan.reqDoc.includes('docs.google.com') || plan.reqDoc.includes('drive.google.com');
                  const isNotion = plan.reqDoc.includes('notion.so') || plan.reqDoc.includes('notion.site');
                  const isConfluence = plan.reqDoc.includes('atlassian.net/wiki') || plan.reqDoc.includes('confluence');
                  const isFigma = plan.reqDoc.includes('figma.com');
                  const isZoom = plan.reqDoc.includes('zoom.us');
                  const isMiro = plan.reqDoc.includes('miro.com');
                  let embedUrl = plan.reqDoc;
                  if (isGoogleDoc && !plan.reqDoc.includes('/embed') && !plan.reqDoc.includes('/preview')) {
                    embedUrl = plan.reqDoc.replace('/edit', '/preview').replace('/view', '/preview');
                    if (!embedUrl.includes('/preview')) embedUrl = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'embedded=true';
                  }
                  if (isFigma && !plan.reqDoc.includes('embed')) {
                    embedUrl = plan.reqDoc.replace('figma.com/file', 'figma.com/embed?embed_host=share&url=' + encodeURIComponent(plan.reqDoc));
                  }
                  const isEmbeddable = isGoogleDoc || isNotion || isConfluence || isFigma || isZoom || isMiro;
                  if (isEmbeddable) {
                    return <iframe src={embedUrl} width="100%" height="100%" className="absolute inset-0" style={{ border: 'none', minHeight: '600px' }} title="Requirements Document" loading="lazy" allow="fullscreen" allowFullScreen />;
                  }
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Document Preview</h4>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">This document type may not support embedding. For best results, use Google Docs, Notion, Confluence, Figma, Zoom Whiteboard, or Miro links.</p>
                      <a href={plan.reqDoc} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
                        Open Document <LinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
