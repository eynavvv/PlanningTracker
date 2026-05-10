import { useState } from 'react';
import { X, FileDown } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReleasePlan {
  id: string;
  goal: string;
  status: string;
  dev_end_date?: string | null;
  external_release_date?: string | null;
}

interface Initiative {
  id: string;
  name: string;
  status: string;
  initialPlanning?: { planned_end_date?: string | null } | null;
  releasePlans?: ReleasePlan[];
}

interface BoardExportModalProps {
  initiatives: Initiative[];
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return null;
  return format(new Date(d + 'T00:00:00'), 'MMM d, yyyy');
}

function isPast(d?: string | null) {
  if (!d) return false;
  return isBefore(startOfDay(new Date(d + 'T00:00:00')), startOfDay(new Date()));
}

const EXCLUDED_INITIATIVE_STATUSES = new Set(['Pending', 'On Hold', 'Post Release']);
const EXCLUDED_RELEASE_STATUSES    = new Set(['Pending']);

function earliestReleaseTarget(init: Initiative): string | null {
  const dates = (init.releasePlans ?? [])
    .map(r => r.external_release_date)
    .filter((d): d is string => !!d)
    .sort();
  return dates[0] ?? null;
}

function sortInitiatives(list: Initiative[]): Initiative[] {
  return [...list].sort((a, b) => {
    const aDate = earliestReleaseTarget(a);
    const bDate = earliestReleaseTarget(b);
    if (aDate && bDate) return aDate < bDate ? -1 : 1;
    if (aDate) return -1;
    if (bDate) return 1;
    return a.name.localeCompare(b.name);
  });
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const INIT_STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Development':       { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  'Release Planning':  { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  'Ready for Release': { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  'Released':          { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
};

const RELEASE_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Ready for Release': { bg: '#dcfce7', color: '#15803d' },
  'Released':          { bg: '#ede9fe', color: '#6d28d9' },
  'Development':       { bg: '#fef3c7', color: '#b45309' },
  'Planning':          { bg: '#dbeafe', color: '#1d4ed8' },
  'Pre-Planning':      { bg: '#cffafe', color: '#0e7490' },
};

// ─── PDF styles ───────────────────────────────────────────────────────────────

// A4 landscape: 842 - 48 = 794pt usable
const COL = { initiative: 185, release: 215, status: 110, devEnd: 142, releaseTarget: 142 };

const S = StyleSheet.create({
  page:          { padding: 24, paddingTop: 28, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },

  headerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  title:         { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  subtitle:      { fontSize: 9, color: '#64748b', marginTop: 2 },
  dateText:      { fontSize: 9, color: '#94a3b8' },

  table:         { width: '100%' },
  thead:         { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 4 },
  th:            { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase',
                   letterSpacing: 0.6, paddingVertical: 7, paddingHorizontal: 8 },

  // each initiative is a horizontal group row
  groupRow:      { flexDirection: 'row', borderTopWidth: 2, borderTopColor: '#cbd5e1' },
  groupRowEven:  { backgroundColor: '#f8fafc' },
  groupRowOdd:   { backgroundColor: '#ffffff' },

  // initiative (left) cell — vertically centered
  initCell:      { width: COL.initiative, justifyContent: 'center', alignItems: 'flex-start',
                   paddingVertical: 10, paddingHorizontal: 8 },
  initName:      { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 5 },
  pill:          { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5,
                   paddingHorizontal: 5, paddingVertical: 2, borderRadius: 99, borderWidth: 1, alignSelf: 'flex-start' },

  // releases (right) stack
  releasesStack: { flex: 1, flexDirection: 'column' },
  releaseRow:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  releaseRowFirst:{ flexDirection: 'row' },
  rd:            { paddingVertical: 9, paddingHorizontal: 8, justifyContent: 'flex-start' },

  releaseGoal:   { fontSize: 9, color: '#334155' },
  badge:         { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase',
                   paddingHorizontal: 5, paddingVertical: 2.5, borderRadius: 4, alignSelf: 'flex-start' },
  dateVal:       { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  dateEmpty:     { fontSize: 9, color: '#cbd5e1' },

  footerNote:    { fontSize: 8, color: '#94a3b8', marginTop: 14 },
});

// ─── PDF Document ─────────────────────────────────────────────────────────────

function ReportDocument({ today, initiatives }: { today: string; initiatives: Initiative[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.title}>Roadmap Status</Text>
            <Text style={S.subtitle}>{initiatives.length} initiative{initiatives.length !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={S.dateText}>{today}</Text>
        </View>

        <View style={S.table}>
          {/* Header */}
          <View style={S.thead} fixed>
            <Text style={[S.th, { width: COL.initiative }]}>Initiative</Text>
            <Text style={[S.th, { width: COL.release }]}>Release</Text>
            <Text style={[S.th, { width: COL.status }]}>Status</Text>
            <Text style={[S.th, { width: COL.devEnd }]}>Dev Complete</Text>
            <Text style={[S.th, { width: COL.releaseTarget }]}>Release Target</Text>
          </View>

          {/* One group-row per initiative */}
          {initiatives.map((init, idx) => {
            const sc = INIT_STATUS_STYLE[init.status] ?? { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
            const releases = (init.releasePlans ?? []).filter(r => !EXCLUDED_RELEASE_STATUSES.has(r.status));

            return (
              <View key={init.id} style={[S.groupRow, idx % 2 === 0 ? S.groupRowOdd : S.groupRowEven]} wrap={false}>
                {/* Initiative cell — vertically centered across all release rows */}
                <View style={S.initCell}>
                  <Text style={S.initName}>{init.name}</Text>
                </View>

                {/* Releases stacked on the right */}
                <View style={S.releasesStack}>
                  {releases.length > 0 ? releases.map((r, rIdx) => {
                    const rc = RELEASE_STATUS_STYLE[r.status] ?? { bg: '#f1f5f9', color: '#475569' };
                    return (
                      <View key={r.id} style={rIdx === 0 ? S.releaseRowFirst : S.releaseRow}>
                        <View style={[S.rd, { width: COL.release }]}>
                          <Text style={S.releaseGoal}>{r.goal}</Text>
                        </View>
                        <View style={[S.rd, { width: COL.status }]}>
                          <Text style={[S.badge, { backgroundColor: rc.bg, color: rc.color }]}>{r.status}</Text>
                        </View>
                        <View style={[S.rd, { width: COL.devEnd }]}>
                          {fmtDate(r.dev_end_date)
                            ? <Text style={S.dateVal}>{fmtDate(r.dev_end_date)}</Text>
                            : <Text style={S.dateEmpty}>—</Text>
                          }
                        </View>
                        <View style={[S.rd, { width: COL.releaseTarget }]}>
                          {fmtDate(r.external_release_date)
                            ? <Text style={[S.dateVal, isPast(r.external_release_date) && { color: '#15803d' }]}>{fmtDate(r.external_release_date)}</Text>
                            : <Text style={S.dateEmpty}>—</Text>
                          }
                        </View>
                      </View>
                    );
                  }) : (
                    <View style={S.releaseRowFirst}>
                      <View style={[S.rd, { width: COL.release }]}>
                        <Text style={{ fontSize: 9, color: '#64748b', fontStyle: 'italic' }}>Planning in progress</Text>
                      </View>
                      <View style={[S.rd, { width: COL.status }]}>
                        <Text style={[S.badge, { backgroundColor: sc.bg, color: sc.color }]}>{init.status}</Text>
                      </View>
                      <View style={[S.rd, { width: COL.devEnd }]}>
                        <Text style={S.dateEmpty}>—</Text>
                      </View>
                      <View style={[S.rd, { width: COL.releaseTarget }]}>
                        {fmtDate(init.initialPlanning?.planned_end_date)
                          ? <>
                              <Text style={S.dateVal}>{fmtDate(init.initialPlanning?.planned_end_date)}</Text>
                              <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 2 }}>End of planning phase</Text>
                            </>
                          : <Text style={S.dateEmpty}>—</Text>
                        }
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={S.footerNote}>Generated on {today}</Text>
      </Page>
    </Document>
  );
}

// ─── Preview (Tailwind) ───────────────────────────────────────────────────────

const INIT_BADGE_CLASS: Record<string, string> = {
  'Development':       'bg-amber-100 text-amber-800 border-amber-300',
  'Release Planning':  'bg-purple-100 text-purple-800 border-purple-300',
  'Ready for Release': 'bg-green-100 text-green-800 border-green-300',
  'Released':          'bg-violet-100 text-violet-800 border-violet-300',
};

const RELEASE_BADGE_CLASS: Record<string, string> = {
  'Ready for Release': 'bg-green-100 text-green-700',
  'Released':          'bg-violet-100 text-violet-700',
  'Development':       'bg-amber-100 text-amber-700',
  'Planning':          'bg-blue-100 text-blue-700',
  'Pre-Planning':      'bg-cyan-100 text-cyan-700',
};

function PreviewTable({ initiatives }: { initiatives: Initiative[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-900 text-white text-left">
          <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-tl-lg w-[22%]">Initiative</th>
          <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider w-[26%]">Release</th>
          <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider w-[14%]">Status</th>
          <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider w-[19%]">Dev Complete</th>
          <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-tr-lg w-[19%]">Release Target</th>
        </tr>
      </thead>
      <tbody>
        {initiatives.map((init, idx) => {
          const releases = (init.releasePlans ?? []).filter(r => !EXCLUDED_RELEASE_STATUSES.has(r.status));
          const rowCount = Math.max(releases.length, 1);
          const rowBg    = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';

          return releases.length > 0 ? releases.map((r, rIdx) => (
            <tr key={r.id} className={`${rowBg} ${rIdx === 0 ? 'border-t-2 border-t-slate-300' : 'border-t border-t-slate-100'}`}>
              {/* Initiative cell with rowspan — only on first release row */}
              {rIdx === 0 && (
                <td className="px-3 py-3 align-middle" rowSpan={rowCount}>
                  <div className="font-semibold text-slate-900 text-xs">{init.name}</div>
                </td>
              )}
              <td className="px-3 py-2.5 text-xs text-slate-700 align-middle">{r.goal}</td>
              <td className="px-3 py-2.5 align-middle">
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap ${RELEASE_BADGE_CLASS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-2.5 text-xs font-semibold text-slate-800 align-middle">
                {fmtDate(r.dev_end_date) ?? <span className="text-slate-300 font-normal">—</span>}
              </td>
              <td className="px-3 py-2.5 text-xs font-semibold align-middle">
                {fmtDate(r.external_release_date)
                  ? <span className={isPast(r.external_release_date) ? 'text-green-700' : 'text-slate-800'}>{fmtDate(r.external_release_date)}</span>
                  : <span className="text-slate-300 font-normal">—</span>
                }
              </td>
            </tr>
          )) : (
            // Initiative with no visible releases
            <tr key={init.id} className={`${rowBg} border-t-2 border-t-slate-300`}>
              <td className="px-3 py-3 align-middle">
                <div className="font-semibold text-slate-900 text-xs">{init.name}</div>
              </td>
              <td className="px-3 py-2.5 align-middle text-xs text-slate-400 italic">Planning in progress</td>
              <td className="px-3 py-2.5 align-middle">
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap ${INIT_BADGE_CLASS[init.status] ?? 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                  {init.status}
                </span>
              </td>
              <td className="px-3 py-2.5 align-middle text-slate-300 text-xs">—</td>
              <td className="px-3 py-2.5 align-middle">
                {fmtDate(init.initialPlanning?.planned_end_date)
                  ? <>
                      <div className="text-xs font-semibold text-slate-800">{fmtDate(init.initialPlanning?.planned_end_date)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">End of planning phase</div>
                    </>
                  : <span className="text-slate-300 text-xs">—</span>
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function BoardExportModal({ initiatives, onClose }: BoardExportModalProps) {
  const today = format(new Date(), 'MMMM d, yyyy');
  const [isGenerating, setIsGenerating] = useState(false);

  const sorted = sortInitiatives(initiatives.filter(i => !EXCLUDED_INITIATIVE_STATUSES.has(i.status)));

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<ReportDocument today={today} initiatives={sorted} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `roadmap-status-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800">Board Export Preview</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sorted.length} initiatives · landscape A4</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              {isGenerating ? 'Generating…' : 'Download PDF'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-auto p-6 flex-1">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-xl font-black text-slate-900">Roadmap Status</h1>
              <p className="text-xs text-slate-400 mt-0.5">{sorted.length} initiative{sorted.length !== 1 ? 's' : ''}</p>
            </div>
            <p className="text-xs text-slate-400">{today}</p>
          </div>
          <PreviewTable initiatives={sorted} />
        </div>
      </div>
    </div>
  );
}
