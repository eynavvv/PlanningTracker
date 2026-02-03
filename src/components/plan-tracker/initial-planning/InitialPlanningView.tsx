import { useState } from 'react';
import { Clock, Link as LinkIcon, FileText, X } from 'lucide-react';
import { PlanningGuidelines, ReleaseProcessGuidelines } from '../guidelines';
import { getStatusColor } from '../utils/statusColors';

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

export function InitialPlanningView({ data, updateInitialPlanning }: InitialPlanningViewProps) {
  const planning = data.Initiative?.InitialPlanning || {};
  const [showReleasePlanDocIframe, setShowReleasePlanDocIframe] = useState(false);
  const [showPRDIframe, setShowPRDIframe] = useState(false);
  const [showFigmaIframe, setShowFigmaIframe] = useState(false);

  return (
    <div className="space-y-6">
      <PlanningGuidelines />
      <ReleaseProcessGuidelines />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
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
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Planned End Date</label>
            <input
              type="date"
              value={planning.PlannedEndDate || ''}
              onChange={(e) => updateInitialPlanning('PlannedEndDate', e.target.value)}
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={planning.Status || ''}
              onChange={(e) => updateInitialPlanning('Status', e.target.value)}
              className={`w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded outline-none text-sm font-medium focus:ring-2 ${getStatusColor(planning.Status)}`}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Initiative Planning">Initiative Planning</option>
              <option value="Release Planning">Release Planning</option>
              <option value="Development">Development</option>
              <option value="Released">Released</option>
              <option value="Post Release">Post Release</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">PRD Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={planning.PRD || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  // Extract src from iframe tag if pasted
                  if (val.includes('<iframe') && val.includes('src=')) {
                    const match = val.match(/src=['"]([^'"]+)['"]/);
                    if (match && match[1]) val = match[1];
                  }
                  updateInitialPlanning('PRD', val);
                }}
                placeholder="Paste link or iframe..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.PRD && (
                <button
                  onClick={() => setShowPRDIframe(!showPRDIframe)}
                  className={`p-1.5 rounded-lg transition-colors ${showPRDIframe ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  title="Toggle PRD Preview"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
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
                type="text"
                value={planning.Figma || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  // Extract src from iframe tag if pasted
                  if (val.includes('<iframe') && val.includes('src=')) {
                    const match = val.match(/src=['"]([^'"]+)['"]/);
                    if (match && match[1]) val = match[1];
                  }
                  updateInitialPlanning('Figma', val);
                }}
                placeholder="Paste link or iframe..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.Figma && (
                <button
                  onClick={() => setShowFigmaIframe(!showFigmaIframe)}
                  className={`p-1.5 rounded-lg transition-colors ${showFigmaIframe ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  title="Toggle Figma Preview"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
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
                type="text"
                value={planning.ReleasePlanSummary || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  // Extract src from iframe tag if pasted
                  if (val.includes('<iframe') && val.includes('src=')) {
                    const match = val.match(/src=['"]([^'"]+)['"]/);
                    if (match && match[1]) val = match[1];
                  }
                  updateInitialPlanning('ReleasePlanSummary', val);
                }}
                placeholder="Paste link or iframe..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-ss-primary focus:border-ss-primary outline-none text-sm text-ss-primary bg-white dark:bg-slate-700"
              />
              {planning.ReleasePlanSummary && (
                <button
                  onClick={() => setShowReleasePlanDocIframe(!showReleasePlanDocIframe)}
                  className={`p-1.5 rounded-lg transition-colors ${showReleasePlanDocIframe ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  title="Toggle Document Preview"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
              {planning.ReleasePlanSummary && (
                <a href={planning.ReleasePlanSummary} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ss-primary transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {showPRDIframe && planning.PRD && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileText className="w-3 h-3 text-blue-600" />
                PRD Preview
              </span>
              <button
                onClick={() => setShowPRDIframe(false)}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full min-h-[600px]">
              {(() => {
                const url = planning.PRD || '';
                // Check if it's an embeddable URL
                const isGoogleDoc = url.includes('docs.google.com') || url.includes('drive.google.com');
                const isNotion = url.includes('notion.so') || url.includes('notion.site');
                const isConfluence = url.includes('atlassian.net/wiki') || url.includes('confluence');
                const isFigma = url.includes('figma.com');
                const isZoom = url.includes('zoom.us');
                const isMiro = url.includes('miro.com');

                // Convert Google Docs URL to embed format if needed
                let embedUrl = url;
                if (isGoogleDoc && !url.includes('/embed') && !url.includes('/preview')) {
                  embedUrl = url
                    .replace('/edit', '/preview')
                    .replace('/view', '/preview');
                  if (!embedUrl.includes('/preview')) {
                    embedUrl = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'embedded=true';
                  }
                }

                // For Figma, convert to embed URL
                if (isFigma && !url.includes('embed')) {
                  embedUrl = url.replace('figma.com/file', 'figma.com/embed?embed_host=share&url=' + encodeURIComponent(url));
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
                      title="PRD Document"
                      loading="lazy"
                      allow="fullscreen"
                      allowFullScreen
                    ></iframe>
                  );
                }

                // For other URLs, show a message with link
                return (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">PRD Preview</h4>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                      This document type may not support embedding. For best results, use Google Docs, Notion, Confluence, Figma, Zoom Whiteboard, or Miro links.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                    >
                      Open PRD <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {showFigmaIframe && planning.Figma && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileText className="w-3 h-3 text-purple-600" />
                Figma Preview
              </span>
              <button
                onClick={() => setShowFigmaIframe(false)}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full min-h-[600px]">
              {(() => {
                const url = planning.Figma || '';
                // Check if it's an embeddable URL
                const isFigma = url.includes('figma.com');
                const isZoom = url.includes('zoom.us');

                // For Figma, convert to embed URL
                let embedUrl = url;
                if (isFigma && !url.includes('embed')) {
                  embedUrl = 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent(url);
                }

                // Check if it's an embeddable URL
                const isEmbeddable = isFigma || isZoom;

                if (isEmbeddable) {
                  return (
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      style={{ border: 'none', minHeight: '600px' }}
                      title="Figma Design"
                      loading="lazy"
                      allow="fullscreen"
                      allowFullScreen
                    ></iframe>
                  );
                }

                // For other URLs, show a message with link
                return (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Figma Preview</h4>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                      This document type may not support embedding. For best results, use Figma links.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                    >
                      Open Figma <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {showReleasePlanDocIframe && planning.ReleasePlanSummary && (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileText className="w-3 h-3 text-emerald-600" />
                Release Plan Document Preview
              </span>
              <button
                onClick={() => setShowReleasePlanDocIframe(false)}
                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full min-h-[600px]">
              {(() => {
                const url = planning.ReleasePlanSummary || '';
                // Check if it's an embeddable URL
                const isGoogleDoc = url.includes('docs.google.com') || url.includes('drive.google.com');
                const isNotion = url.includes('notion.so') || url.includes('notion.site');
                const isConfluence = url.includes('atlassian.net/wiki') || url.includes('confluence');
                const isFigma = url.includes('figma.com');
                const isZoom = url.includes('zoom.us');
                const isMiro = url.includes('miro.com');

                // Convert Google Docs URL to embed format if needed
                let embedUrl = url;
                if (isGoogleDoc && !url.includes('/embed') && !url.includes('/preview')) {
                  embedUrl = url
                    .replace('/edit', '/preview')
                    .replace('/view', '/preview');
                  if (!embedUrl.includes('/preview')) {
                    embedUrl = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'embedded=true';
                  }
                }

                // For Figma, convert to embed URL
                if (isFigma && !url.includes('embed')) {
                  embedUrl = url.replace('figma.com/file', 'figma.com/embed?embed_host=share&url=' + encodeURIComponent(url));
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
                      title="Release Plan Document"
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
                      href={url}
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
  );
}
