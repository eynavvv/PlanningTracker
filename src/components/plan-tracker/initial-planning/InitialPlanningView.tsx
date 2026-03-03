import { useState } from 'react';
import { Link as LinkIcon, FileText, Layers, Figma, CheckCircle2 } from 'lucide-react';

interface InitialPlanning {
  StartDate?: string;
  PlannedEndDate?: string;
  Status?: string;
  PRD?: string;
  Figma?: string;
  ReleasePlanSummary?: string;
}

interface InitialPlanningViewProps {
  data: {
    Initiative?: {
      InitialPlanning?: InitialPlanning;
    };
  };
  updateInitialPlanning: (field: string, value: string) => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDuration(startStr?: string, endStr?: string): string {
  if (!startStr || !endStr) return '';
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return '';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

function getEmbedUrl(url: string): { embedUrl: string; isEmbeddable: boolean } {
  const isGoogleDoc = url.includes('docs.google.com') || url.includes('drive.google.com');
  const isNotion = url.includes('notion.so') || url.includes('notion.site');
  const isConfluence = url.includes('atlassian.net/wiki') || url.includes('confluence');
  const isFigma = url.includes('figma.com');
  const isZoom = url.includes('zoom.us');
  const isMiro = url.includes('miro.com');

  let embedUrl = url;
  if (isGoogleDoc && !url.includes('/embed') && !url.includes('/preview')) {
    embedUrl = url.replace('/edit', '/preview').replace('/view', '/preview');
    if (!embedUrl.includes('/preview')) embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'embedded=true';
  }
  if (isFigma && !url.includes('embed')) {
    embedUrl = 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent(url);
  }

  return {
    embedUrl,
    isEmbeddable: isGoogleDoc || isNotion || isConfluence || isFigma || isZoom || isMiro,
  };
}

export function InitialPlanningView({ data, updateInitialPlanning }: InitialPlanningViewProps) {
  const planning = data.Initiative?.InitialPlanning || {};
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const duration = getDuration(planning.StartDate, planning.PlannedEndDate);

  const bothDates = !!(planning.StartDate && planning.PlannedEndDate);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const startDate = planning.StartDate ? new Date(planning.StartDate + 'T00:00:00') : null;
  const endDate = planning.PlannedEndDate ? new Date(planning.PlannedEndDate + 'T00:00:00') : null;
  const todayPercent = (bothDates && startDate && endDate && endDate > startDate)
    ? ((todayDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100
    : 0;
  const clampedPercent = Math.max(0, Math.min(100, todayPercent));
  const isOverdue = bothDates && endDate !== null && todayDate > endDate;
  const daysOverdue = isOverdue && endDate
    ? Math.round((todayDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const docs = [
    {
      key: 'PRD',
      label: 'PRD',
      description: 'Product Requirements Document',
      value: planning.PRD || '',
      icon: FileText,
      colorIcon: 'text-blue-600 dark:text-blue-400',
      colorBg: 'bg-blue-50 dark:bg-blue-900/20',
      colorBorder: 'border-blue-200 dark:border-blue-800',
      colorPreviewActive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
      colorOpenBtn: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      key: 'Figma',
      label: 'Figma',
      description: 'Design & Prototype',
      value: planning.Figma || '',
      icon: Figma,
      colorIcon: 'text-purple-600 dark:text-purple-400',
      colorBg: 'bg-purple-50 dark:bg-purple-900/20',
      colorBorder: 'border-purple-200 dark:border-purple-800',
      colorPreviewActive: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700',
      colorOpenBtn: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      key: 'ReleasePlanSummary',
      label: 'Release Plan Whiteboard',
      description: 'Release strategy and scope',
      value: planning.ReleasePlanSummary || '',
      icon: Layers,
      colorIcon: 'text-emerald-600 dark:text-emerald-400',
      colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      colorBorder: 'border-emerald-200 dark:border-emerald-800',
      colorPreviewActive: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
      colorOpenBtn: 'bg-emerald-600 hover:bg-emerald-700',
    },
  ];

  const renderDateCell = (fieldKey: 'StartDate' | 'PlannedEndDate', label: string, align: 'left' | 'right' = 'left') => {
    const value = planning[fieldKey] || '';
    const isEditing = editingField === fieldKey;
    return (
      <div className={`flex flex-col gap-1.5 ${align === 'right' ? 'items-end' : ''}`}>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        {isEditing ? (
          <input
            type="date"
            autoFocus
            value={value}
            onChange={(e) => updateInitialPlanning(fieldKey, e.target.value)}
            onBlur={() => setEditingField(null)}
            className="text-sm font-bold bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-100 shadow-sm"
          />
        ) : (
          <span
            onClick={() => setEditingField(fieldKey)}
            className={`text-sm font-bold cursor-pointer rounded-lg px-3 py-2 transition-all border ${
              value
                ? 'text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                : 'text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-400 italic'
            }`}
          >
            {value ? formatDate(value) : '+ Set date'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-8 py-6">
        <div className="flex items-center gap-6">
          {renderDateCell('StartDate', 'Initiative Start')}

          <div className="flex-1 relative min-w-0" style={{ height: '52px' }}>
            {/* Start dot */}
            <div className={`absolute left-0 top-[16px] -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10 transition-colors ${planning.StartDate ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
            {/* End dot */}
            <div className={`absolute right-0 top-[16px] -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 z-10 transition-colors ${planning.PlannedEndDate ? 'bg-blue-500 border-blue-600' : 'border-slate-300 dark:border-slate-500'}`} />

            {/* Background line */}
            <div className="absolute left-[5px] right-[5px] top-[16px] -translate-y-1/2 h-px bg-slate-200 dark:bg-slate-600" />

            {bothDates && (
              <>
                {/* Lighter fill for future portion */}
                <div className={`absolute left-[5px] right-[5px] top-[16px] -translate-y-1/2 h-px ${isOverdue ? 'bg-emerald-200 dark:bg-emerald-900/60' : 'bg-blue-200 dark:bg-blue-900/60'}`} />

                {/* Solid fill from start to today (or full bar if done) */}
                {todayPercent > 0 && (
                  <div
                    className={`absolute left-[5px] top-[16px] -translate-y-1/2 h-px ${isOverdue ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-blue-500 dark:bg-blue-400'}`}
                    style={{ width: `calc((100% - 10px) * ${Math.min(todayPercent, 100) / 100})` }}
                  />
                )}

                {/* Today marker — only shown when not overdue */}
                {!isOverdue && (
                  <div
                    className="absolute flex flex-col items-center z-20"
                    style={{
                      left: `calc(5px + (100% - 10px) * ${clampedPercent / 100})`,
                      top: '8px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="w-[2px] h-4 rounded-full bg-orange-400 dark:bg-orange-500" />
                    <span className="text-[9px] font-black text-orange-500 dark:text-orange-400 whitespace-nowrap leading-none mt-0.5">
                      Today
                    </span>
                  </div>
                )}

                {/* Planning done badge — replaces duration at bottom-center */}
                {isOverdue && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      Planning done
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Duration badge */}
            {duration && !isOverdue && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  ~{duration}
                </span>
              </div>
            )}
          </div>

          {renderDateCell('PlannedEndDate', 'Planned End', 'right')}
        </div>
      </div>

      {/* Document cards */}
      {docs.map((doc) => {
        const isPreviewOpen = activePreview === doc.key;
        const { embedUrl, isEmbeddable } = doc.value ? getEmbedUrl(doc.value) : { embedUrl: '', isEmbeddable: false };
        const Icon = doc.icon;

        return (
          <div
            key={doc.key}
            className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm overflow-hidden transition-all ${
              isPreviewOpen
                ? 'border-slate-300 dark:border-slate-600'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {/* Card header row */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${doc.colorBg} ${doc.colorBorder}`}>
                <Icon className={`w-5 h-5 ${doc.colorIcon}`} />
              </div>
              <div className="flex flex-col gap-0.5 w-40 flex-shrink-0">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{doc.label}</span>
                <span className="text-[10px] text-slate-400">{doc.description}</span>
              </div>
              <input
                type="text"
                value={doc.value}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('<iframe') && val.includes('src=')) {
                    const match = val.match(/src=['"]([^'"]+)['"]/);
                    if (match && match[1]) val = match[1];
                  }
                  updateInitialPlanning(doc.key, val);
                }}
                placeholder="Paste link or iframe..."
                className={`flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none text-sm focus:border-blue-300 dark:focus:border-blue-600 focus:bg-white dark:focus:bg-slate-700 transition-all ${
                  doc.value
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.value && (
                  <>
                    <button
                      onClick={() => setActivePreview(isPreviewOpen ? null : doc.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isPreviewOpen
                          ? doc.colorPreviewActive
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {isPreviewOpen ? 'Close' : 'Preview'}
                    </button>
                    <a
                      href={doc.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={`Open ${doc.label} in new tab`}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Inline preview */}
            {isPreviewOpen && doc.value && (
              <div className="border-t border-slate-100 dark:border-slate-700">
                <div className="relative w-full min-h-[600px]">
                  {isEmbeddable ? (
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      style={{ border: 'none', minHeight: '600px' }}
                      title={`${doc.label} Preview`}
                      loading="lazy"
                      allow="fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/50">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 ${doc.colorBg} ${doc.colorBorder}`}>
                        <Icon className={`w-8 h-8 ${doc.colorIcon}`} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{doc.label} Preview</h4>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm">
                        This document type may not support embedding. For best results, use Google Docs, Notion, Confluence, Figma, Zoom Whiteboard, or Miro links.
                      </p>
                      <a
                        href={doc.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 ${doc.colorOpenBtn} text-white font-bold rounded-lg flex items-center gap-2 transition-colors`}
                      >
                        Open {doc.label} <LinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
