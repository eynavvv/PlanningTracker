import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    format,
    addDays,
    subDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isFirstDayOfMonth,
    differenceInDays,
    startOfWeek,
    addWeeks,
    isWithinInterval,
    isBefore,
    isAfter,
    isEqual
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Calendar, Info, Clock, Layers, Rocket, Eye, EyeOff } from 'lucide-react';
import { getHolidaysInRange, getHolidayStyle } from '../utils/holidayUtils';

// Team logo images
const TEAM_LOGOS = {
    Pegasus: '/pegasus-logo.png',
    Zebra: '/zebra-logo.png'
};

const TimelineView = ({ data, roadmapFillers, onUpdateItem }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null); // { id, deltaDays, originalStartDate, originalEndDate }
    const [showHolidays, setShowHolidays] = useState(false);
    const [filters, setFilters] = useState({ group: [], pm: [], ux: [], techLead: [] });
    const [openFilter, setOpenFilter] = useState(null); // 'group' | 'pm' | 'ux' | 'techLead' | null
    const scrollContainerRef = useRef(null);
    const filterRefs = useRef({});
    const [shouldFlipTooltip, setShouldFlipTooltip] = useState(false);

    const toggleFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
        }));
    };

    const totalActiveFilters = filters.group.length + filters.pm.length + filters.ux.length + filters.techLead.length;

    const handleTooltipHover = (e) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const elemRect = e.currentTarget.getBoundingClientRect();
        const spaceAbove = elemRect.top - containerRect.top;
        setShouldFlipTooltip(spaceAbove < 200);
    };

    // Process data into timeline items
    const timelineItems = useMemo(() => {
        const items = [];
        if (data) {
            data.forEach(initiative => {
                // 1. Initiative Planning Phase
                if (initiative.initialPlanning?.start_date && initiative.initialPlanning?.planned_end_date) {
                    items.push({
                        id: `init-plan-${initiative.id}`,
                        name: initiative.name,
                        phase: 'Initiative Planning',
                        startDate: new Date(initiative.initialPlanning.start_date),
                        endDate: new Date(initiative.initialPlanning.planned_end_date),
                        type: 'initiative-planning',
                        initiativeName: initiative.name,
                        initiativeId: initiative.id,
                        group: initiative.group,
                        pm: initiative.pm,
                        ux: initiative.ux,
                        techLead: initiative.techLead,
                        detailedStatus: initiative.detailedStatus,
                        overallStatus: initiative.status,
                        deliverables: initiative.deliverables
                    });
                }

                // 2. Release Phases
                initiative.releasePlans?.forEach(rp => {
                    // Release Pre-Planning
                    if (rp.pre_planning_start_date && rp.pre_planning_end_date) {
                        items.push({
                            id: `release-pre-plan-${rp.id}`,
                            name: rp.goal,
                            phase: 'Pre-Planning',
                            startDate: new Date(rp.pre_planning_start_date),
                            endDate: new Date(rp.pre_planning_end_date),
                            type: 'release-pre-planning',
                            initiativeName: initiative.name,
                            initiativeId: initiative.id,
                            group: initiative.group,
                            pm: initiative.pm,
                            ux: initiative.ux,
                            techLead: initiative.techLead,
                            releaseId: rp.id,
                            detailedStatus: initiative.detailedStatus,
                            overallStatus: initiative.status,
                            deliverables: initiative.deliverables
                        });
                    }

                    // Release Planning
                    if (rp.planning_start_date && rp.planning_end_date) {
                        items.push({
                            id: `release-plan-${rp.id}`,
                            name: rp.goal,
                            phase: 'Planning',
                            startDate: new Date(rp.planning_start_date),
                            endDate: new Date(rp.planning_end_date),
                            type: 'release-planning',
                            initiativeName: initiative.name,
                            initiativeId: initiative.id,
                            group: initiative.group,
                            pm: initiative.pm,
                            ux: initiative.ux,
                            techLead: initiative.techLead,
                            releaseId: rp.id,
                            detailedStatus: initiative.detailedStatus,
                            overallStatus: initiative.status,
                            deliverables: initiative.deliverables
                        });
                    }

                    // Release Dev
                    if (rp.dev_start_date && rp.dev_end_date) {
                        items.push({
                            id: `release-dev-${rp.id}`,
                            name: rp.goal,
                            phase: 'Dev',
                            startDate: new Date(rp.dev_start_date),
                            endDate: new Date(rp.dev_end_date),
                            type: 'release-dev',
                            initiativeName: initiative.name,
                            initiativeId: initiative.id,
                            group: initiative.group,
                            pm: initiative.pm,
                            ux: initiative.ux,
                            techLead: initiative.techLead,
                            releaseId: rp.id,
                            detailedStatus: initiative.detailedStatus,
                            overallStatus: initiative.status,
                            deliverables: initiative.deliverables
                        });
                    }

                    // QA Event Milestone
                    if (rp.qa_event_date) {
                        items.push({
                            id: `qa-event-${rp.id}`,
                            name: rp.goal,
                            phase: 'QA Event',
                            startDate: new Date(rp.qa_event_date),
                            endDate: new Date(rp.qa_event_date),
                            type: 'qa-event',
                            isMilestone: true,
                            initiativeName: initiative.name,
                            initiativeId: initiative.id,
                            group: initiative.group,
                            pm: initiative.pm,
                            ux: initiative.ux,
                            techLead: initiative.techLead,
                            releaseId: rp.id,
                            detailedStatus: initiative.detailedStatus,
                            overallStatus: initiative.status,
                            deliverables: initiative.deliverables
                        });
                    }
                });
            });
        }

        // Add Roadmap Fillers
        if (roadmapFillers) {
            roadmapFillers.forEach(filler => {
                if (filler.target_date) {
                    items.push({
                        id: `filler-${filler.id}`,
                        name: filler.name,
                        phase: filler.phase || 'Filler',
                        startDate: new Date(filler.target_date),
                        endDate: new Date(filler.target_date),
                        type: 'roadmap-filler',
                        isMilestone: true,
                        markerType: 'filler',
                        initiativeName: 'Roadmap Fillers',
                        initiativeId: 'roadmap-fillers',
                        group: filler.group || 'General',
                        detailedStatus: filler.description,
                        isFiller: true
                    });
                }
            });
        }

        return items.sort((a, b) => a.startDate - b.startDate);
    }, [data, roadmapFillers]);

    const filterOptions = useMemo(() => {
        const groups = new Set(), pms = new Set(), uxs = new Set(), techLeads = new Set();
        timelineItems.forEach(item => {
            if (item.initiativeName === 'Roadmap Fillers') return;
            if (item.group) groups.add(item.group);
            if (item.pm) pms.add(item.pm);
            if (item.ux) uxs.add(item.ux);
            if (item.techLead) {
                item.techLead.split(',').forEach(tl => {
                    const trimmed = tl.trim();
                    if (trimmed) techLeads.add(trimmed);
                });
            }
        });
        return {
            group: Array.from(groups).sort(),
            pm: Array.from(pms).sort(),
            ux: Array.from(uxs).sort(),
            techLead: Array.from(techLeads).sort(),
        };
    }, [timelineItems]);

    // Calculate timeline range
    const range = useMemo(() => {
        if (timelineItems.length === 0) return null;

        let min = new Date(Math.min(...timelineItems.map(i => i.startDate)));
        let max = new Date(Math.max(...timelineItems.map(i => i.endDate)));

        // Add padding
        min = startOfWeek(subDays(min, 7));
        max = addWeeks(max, 2);

        return { min, max, totalDays: differenceInDays(max, min) };
    }, [timelineItems]);

    if (!range || timelineItems.length === 0) return null;

    const dayWidth = 24; // Width of one day in pixels
    const timelineWidth = range.totalDays * dayWidth;

    const getPosition = (date) => {
        const diff = differenceInDays(new Date(date), range.min);
        return diff * dayWidth;
    };

    const getWidth = (start, end) => {
        const diff = differenceInDays(new Date(end), new Date(start));
        return Math.max(diff * dayWidth, 40); // Min width for visibility
    };

    // Group items by initiative for row placement (or just stack them)
    // For simplicity and matching the mockup, we'll use a basic stacking algorithm or initiative-based rows
    const rows = [];
    const initiativeRows = {};

    timelineItems.forEach(item => {
        if (!initiativeRows[item.initiativeName]) {
            initiativeRows[item.initiativeName] = [];
        }
        initiativeRows[item.initiativeName].push(item);
    });

    const displayedInitiativeRows = totalActiveFilters === 0
        ? initiativeRows
        : Object.fromEntries(
            Object.entries(initiativeRows).filter(([name, items]) => {
                if (name === 'Roadmap Fillers') return true;
                const item = items[0];
                if (filters.group.length > 0 && !filters.group.includes(item?.group)) return false;
                if (filters.pm.length > 0 && !filters.pm.includes(item?.pm)) return false;
                if (filters.ux.length > 0 && !filters.ux.includes(item?.ux)) return false;
                if (filters.techLead.length > 0) {
                    const itemTechLeads = (item?.techLead || '').split(',').map(tl => tl.trim()).filter(Boolean);
                    if (!filters.techLead.some(tl => itemTechLeads.includes(tl))) return false;
                }
                return true;
            })
        );

    const monthMarkers = [];
    let currentMonth = startOfMonth(range.min);
    while (currentMonth <= range.max) {
        monthMarkers.push({
            date: currentMonth,
            left: getPosition(currentMonth),
            label: format(currentMonth, 'MMMM yyyy')
        });
        currentMonth = addDays(endOfMonth(currentMonth), 1);
    }

    const weekMarkers = [];
    let currentWeek = startOfWeek(range.min);
    while (currentWeek <= range.max) {
        weekMarkers.push({
            date: currentWeek,
            left: getPosition(currentWeek),
            label: format(currentWeek, 'MMM d'),
            width: dayWidth * 7
        });
        currentWeek = addDays(currentWeek, 7);
    }

    // Holiday bands
    const holidays = getHolidaysInRange(range.min, range.max).map(h => {
        const hStart = new Date(h.startDate);
        const hEnd = new Date(h.endDate);
        const left = getPosition(hStart);
        const width = Math.max(getWidth(hStart, hEnd), dayWidth); // at least 1 day wide
        const style = getHolidayStyle(h.category);
        return { ...h, left, width, style };
    });

    const today = new Date();
    const todayPos = isWithinInterval(today, { start: range.min, end: range.max }) ? getPosition(today) : null;

    // Dragging & Resizing Logic
    const handleDragStart = (e, item, type = 'move') => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        document.body.style.cursor = type === 'move' ? 'grabbing' : 'ew-resize';

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaDays = Math.round(deltaX / dayWidth);

            if (type === 'move') {
                setDraggingItem({
                    ...item,
                    type,
                    tempStartDate: addDays(item.startDate, deltaDays),
                    tempEndDate: addDays(item.endDate, deltaDays)
                });
            } else if (type === 'resize-start') {
                const newStart = addDays(item.startDate, deltaDays);
                // Prevent start from going past end
                if (isBefore(newStart, item.endDate) || isEqual(newStart, item.endDate)) {
                    setDraggingItem({
                        ...item,
                        type,
                        tempStartDate: newStart,
                        tempEndDate: item.endDate
                    });
                }
            } else if (type === 'resize-end') {
                const newEnd = addDays(item.endDate, deltaDays);
                // Prevent end from going before start
                if (isAfter(newEnd, item.startDate) || isEqual(newEnd, item.startDate)) {
                    setDraggingItem({
                        ...item,
                        type,
                        tempStartDate: item.startDate,
                        tempEndDate: newEnd
                    });
                }
            }
        };

        const handleMouseUp = (upEvent) => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';

            const deltaX = upEvent.clientX - startX;
            const deltaDays = Math.round(deltaX / dayWidth);

            if (deltaDays !== 0) {
                let newStartDate = item.startDate;
                let newEndDate = item.endDate;

                if (type === 'move') {
                    newStartDate = addDays(item.startDate, deltaDays);
                    newEndDate = addDays(item.endDate, deltaDays);
                } else if (type === 'resize-start') {
                    newStartDate = addDays(item.startDate, deltaDays);
                    if (isAfter(newStartDate, item.endDate)) newStartDate = item.endDate;
                } else if (type === 'resize-end') {
                    newEndDate = addDays(item.endDate, deltaDays);
                    if (isBefore(newEndDate, item.startDate)) newEndDate = item.startDate;
                }

                onUpdateItem?.(item, newStartDate, newEndDate);
            } else if (Math.abs(deltaX) < 5) {
                // Treat as click if movement is very small (< 5px)
                handleItemClick(item);
            }

            setDraggingItem(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleItemClick = (item) => {
        if (item.type === 'initiative-planning') {
            navigate(`/plan/${encodeURIComponent(item.initiativeId)}?view=initial_planning`);
        } else {
            navigate(`/plan/${encodeURIComponent(item.initiativeId)}?view=release_plans`);
        }
    };

    useEffect(() => {
        if (!openFilter) return;
        const handleClickOutside = (e) => {
            if (filterRefs.current[openFilter] && !filterRefs.current[openFilter].contains(e.target)) {
                setOpenFilter(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openFilter]);

    useEffect(() => {
        if (isExpanded && scrollContainerRef.current && todayPos !== null) {
            // Small delay to ensure the DOM has updated and is ready to scroll
            const timer = setTimeout(() => {
                const container = scrollContainerRef.current;
                const containerWidth = container.offsetWidth;
                const scrollLeft = todayPos - (containerWidth / 2);
                container.scrollTo({
                    left: Math.max(0, scrollLeft),
                    behavior: 'smooth'
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isExpanded, todayPos]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 transition-all duration-300">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-ss-primary" />
                    <h2 className="font-bold text-ss-navy dark:text-white">Release Timeline</h2>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {timelineItems.length} PHASES
                    </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    {isExpanded && (
                        <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowHolidays(v => !v); }}
                            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${showHolidays ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            title={showHolidays ? 'Hide holidays' : 'Show holidays'}
                        >
                            {showHolidays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            Holidays
                        </button>
                        {[
                            { key: 'group', label: 'Group' },
                            { key: 'pm', label: 'PM' },
                            { key: 'ux', label: 'UX' },
                            { key: 'techLead', label: 'Tech Lead' },
                        ].map(({ key, label }) => filterOptions[key]?.length > 0 && (
                            <div key={key} className="relative" ref={el => filterRefs.current[key] = el}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenFilter(v => v === key ? null : key); }}
                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${filters[key].length > 0 || openFilter === key ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    {label}
                                    {filters[key].length > 0 && (
                                        <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">{filters[key].length}</span>
                                    )}
                                </button>
                                {openFilter === key && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-3 min-w-[160px]"
                                    >
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
                                        <div className="flex flex-col gap-1.5">
                                            {filterOptions[key].map(value => (
                                                <button
                                                    key={value}
                                                    onClick={() => toggleFilter(key, value)}
                                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left w-full ${filters[key].includes(value) ? 'bg-blue-500 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                                >
                                                    {key === 'group' && TEAM_LOGOS[value] && (
                                                        <img src={TEAM_LOGOS[value]} alt="" className="w-4 h-4 rounded-full object-cover flex-none" />
                                                    )}
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                        {filters[key].length > 0 && (
                                            <button
                                                onClick={() => setFilters(prev => ({ ...prev, [key]: [] }))}
                                                className="mt-2 w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-center"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        </>
                    )}
                    <span className="text-xs font-medium">{isExpanded ? 'Collapse' : 'Expand Timeline'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {isExpanded && (
                <div className="flex flex-col">
                {/* Holiday Legend */}
                {showHolidays && (
                    <div className="flex items-center gap-4 px-6 py-1.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Holidays</span>
                        {[
                            { label: 'Major', category: 'major' },
                            { label: 'Memorial', category: 'memorial' },
                            { label: 'Minor', category: 'minor' },
                        ].map(({ label, category }) => {
                            const s = getHolidayStyle(category);
                            return (
                                <div key={category} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-sm ${s.dot}`} style={{ opacity: 0.7 }} />
                                    <span className={`text-[10px] font-medium ${s.text}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div
                    ref={scrollContainerRef}
                    className="overflow-auto max-h-[75vh] custom-scrollbar bg-white dark:bg-slate-900"
                >
                    <div
                        className="relative"
                        style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
                    >
                        {/* Sticky Month & Week Headers */}
                        <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm" style={{ height: '48px' }}>
                            <div className="relative h-full">
                                {/* Month Labels */}
                                {monthMarkers.map((m, idx) => (
                                    <div
                                        key={`month-${idx}`}
                                        className="absolute top-0 border-l border-slate-200 dark:border-slate-700 h-full"
                                        style={{ left: `${m.left}px` }}
                                    >
                                        <span className="absolute top-1 left-2 text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {m.label}
                                        </span>
                                    </div>
                                ))}
                                {/* Week Date Labels */}
                                {weekMarkers.map((w, idx) => (
                                    <div
                                        key={`week-${idx}`}
                                        className="absolute top-6 border-l border-slate-200 dark:border-slate-700 h-full z-0"
                                        style={{ left: `${w.left}px` }}
                                    >
                                        <span className="absolute top-0 left-1 text-[8px] font-black text-slate-400 dark:text-slate-500 whitespace-nowrap bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                                            {w.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="relative pb-6 pt-4">
                        {/* Month Grid Lines */}
                        {monthMarkers.map((m, idx) => (
                            <div
                                key={`month-line-${idx}`}
                                className="absolute top-0 border-l border-slate-200 dark:border-slate-700 h-full"
                                style={{ left: `${m.left}px` }}
                            />
                        ))}

                        {/* Week Alternating Backgrounds */}
                        {weekMarkers.map((w, idx) => (
                            idx % 2 === 0 && (
                                <div
                                    key={`week-bg-${idx}`}
                                    className="absolute top-0 bottom-0 bg-slate-50 dark:bg-slate-800/50 opacity-40 -z-10"
                                    style={{ left: `${w.left}px`, width: `${w.width}px` }}
                                />
                            )
                        ))}

                        {/* Week Grid Lines */}
                        {weekMarkers.map((w, idx) => (
                            <div
                                key={`week-line-${idx}`}
                                className="absolute top-0 border-l border-slate-200 dark:border-slate-700 h-full z-0"
                                style={{ left: `${w.left}px` }}
                            />
                        ))}

                        {/* Holiday Bands */}
                        {showHolidays && holidays.map((h, idx) => {
                            const isNarrow = h.width < 48;
                            const isSingleDay = h.startDate === h.endDate;
                            const dateLabel = isSingleDay
                                ? format(new Date(h.startDate), 'MMM d, yyyy')
                                : `${format(new Date(h.startDate), 'MMM d')} – ${format(new Date(h.endDate), 'MMM d, yyyy')}`;
                            return (
                                <div
                                    key={`holiday-${idx}`}
                                    className="absolute top-0 bottom-0 z-[1] pointer-events-none"
                                    style={{
                                        left: `${h.left}px`,
                                        width: `${h.width}px`,
                                        backgroundColor: h.style.bg,
                                        borderLeft: `1px solid ${h.style.border}`,
                                        borderRight: `1px solid ${h.style.border}`,
                                    }}
                                >
                                    {/* Label with tooltip */}
                                    <span
                                        className={`absolute ${h.style.text} font-bold whitespace-nowrap select-none pointer-events-auto cursor-default group/holiday ${isNarrow ? 'text-[6px] writing-mode-vertical' : 'text-[7px]'}`}
                                        onMouseEnter={handleTooltipHover}
                                        style={{
                                            top: isNarrow ? '8px' : '8px',
                                            left: isNarrow ? '50%' : '2px',
                                            ...(isNarrow
                                                ? { writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'translateX(-50%)' }
                                                : {}),
                                        }}
                                    >
                                        {h.nameHe}
                                        <span className={`invisible group-hover/holiday:visible absolute ${shouldFlipTooltip ? 'top-full mt-1.5' : 'bottom-full mb-1.5'} left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-ss-navy text-white rounded-md shadow-xl z-[100] whitespace-nowrap pointer-events-none text-[10px] font-medium before:content-[''] before:absolute ${shouldFlipTooltip ? 'before:bottom-full before:border-b-ss-navy' : 'before:top-full before:border-t-ss-navy'} before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent`} style={{ writingMode: 'horizontal-tb', textOrientation: 'initial' }}>
                                            <span className="font-bold">{h.name}</span>
                                            <br />
                                            {dateLabel}
                                        </span>
                                    </span>
                                </div>
                            );
                        })}

                        {/* Today Line */}
                        {todayPos !== null && (
                            <div
                                className="absolute top-0 bottom-0 border-l-2 border-ss-action z-10 before:content-[''] before:absolute before:top-0 before:-left-1 before:w-2 before:h-2 before:bg-ss-action before:rounded-full"
                                style={{ left: `${todayPos}px` }}
                                title="Today"
                            >
                                <span className="absolute top-1 -left-4 -translate-x-full text-[8px] font-black text-ss-action bg-white dark:bg-slate-900 px-1 shadow-sm border border-ss-action/20">TODAY</span>
                            </div>
                        )}

                        {/* Bars */}
                        <div className="flex flex-col gap-6 relative z-0">
                            {Object.entries(displayedInitiativeRows).map(([name, items], rowIdx) => {
                                // Strict grouping: Initial Plan on row 0, then one row per Release
                                const subRows = [];
                                const isFillerRow = name === 'Roadmap Fillers';

                                if (isFillerRow) {
                                    // Stacking algorithm for fillers to avoid horizontal overlap
                                    const sortedItems = [...items].sort((a, b) => a.startDate - b.startDate);
                                    const rows = [];

                                    sortedItems.forEach(item => {
                                        let placed = false;
                                        for (const row of rows) {
                                            // Check if item overlaps with any item in this row (with 5 day padding for visibility)
                                            const overlaps = row.some(rowItem => {
                                                const startA = subDays(item.startDate, 5);
                                                const endA = addDays(item.endDate, 5);
                                                const startB = rowItem.startDate;
                                                const endB = rowItem.endDate;
                                                return isBefore(startA, endB) && isAfter(endA, startB);
                                            });

                                            if (!overlaps) {
                                                row.push(item);
                                                placed = true;
                                                break;
                                            }
                                        }
                                        if (!placed) rows.push([item]);
                                    });
                                    subRows.push(...rows);
                                } else {

                                    // 1. Initiative Planning (no releaseId)
                                    const initItems = items.filter(i => !i.releaseId);



                                    // 2. Group by Release ID
                                    const releaseGroups = {};
                                    items.filter(i => i.releaseId).forEach(i => {
                                        if (!releaseGroups[i.releaseId]) releaseGroups[i.releaseId] = [];
                                        releaseGroups[i.releaseId].push(i);
                                    });

                                    // Sort releases by date to ensure chronological order top-to-bottom
                                    const sortedReleaseGroups = Object.values(releaseGroups).sort((a, b) => {
                                        const startA = Math.min(...a.map(i => i.startDate));
                                        const startB = Math.min(...b.map(i => i.startDate));
                                        return startA - startB;
                                    });

                                    // Merge Initiative Planning with First Release
                                    if (sortedReleaseGroups.length > 0) {
                                        // Row 0: Initiative Planning + 1st Release
                                        subRows.push([...initItems, ...sortedReleaseGroups[0]]);

                                        // Subsequent Rows: Remaining Releases
                                        sortedReleaseGroups.slice(1).forEach(group => subRows.push(group));
                                    } else if (initItems.length > 0) {
                                        // If no releases, just show Initiative Planning
                                        subRows.push(initItems);
                                    }
                                }

                                // Get the group from the first item in this initiative's items
                                const initiativeGroup = items[0]?.group;
                                const teamLogo = isFillerRow ? null : TEAM_LOGOS[initiativeGroup];

                                return (
                                    <div key={name} className="relative flex flex-col gap-2 border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <div className="sticky left-0 z-10 flex items-center gap-2 mb-3 pl-0 py-1 w-fit max-w-[calc(100vw-300px)]">
                                            {/* Decorative Background for legibility when scrolling */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent -z-10 rounded-r-xl" />

                                            {/* Icon/Logo */}
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full overflow-hidden shadow-sm border ${isFillerRow ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700'}`}>
                                                {isFillerRow ? (
                                                    <Rocket className="w-4 h-4" />
                                                ) : teamLogo ? (
                                                    <img
                                                        src={teamLogo}
                                                        alt={`${initiativeGroup} team`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                        {initiativeGroup?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className={`text-sm font-bold tracking-tight ${isFillerRow ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>
                                                    {name}
                                                </h3>
                                                <div className={`h-px w-12 self-center opacity-50 ${isFillerRow ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            </div>
                                        </div>

                                        {subRows.map((rowItems, subRowIdx) => (
                                            <div key={`${name}-subrow-${subRowIdx}`} className="relative h-8 w-full" style={{ overflow: 'visible' }}>
                                                {rowItems.map(item => {
                                                    const isDragging = draggingItem?.id === item.id;
                                                    const currentStartDate = isDragging ? draggingItem.tempStartDate : item.startDate;
                                                    const currentEndDate = isDragging ? draggingItem.tempEndDate : item.endDate;
                                                    const left = getPosition(currentStartDate);
                                                    const width = getWidth(currentStartDate, currentEndDate);

                                                    const colorClass =
                                                        item.type === 'initiative-planning' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/70' :
                                                            item.type === 'release-pre-planning' ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-900/70' :
                                                                item.type === 'release-planning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/70' :
                                                                    item.type === 'qa-event' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/70' :
                                                                        'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/70';

                                                    // Render milestone (icon above with anchor dot on timeline)
                                                    if (item.isMilestone) {
                                                        const isFiller = item.type === 'roadmap-filler';
                                                        const mainColor = isFiller ? 'indigo' : 'orange';
                                                        const gradientFrom = isFiller ? 'from-indigo-400' : 'from-orange-400';
                                                        const gradientTo = isFiller ? 'to-indigo-600' : 'to-orange-600';
                                                        const glowColor = isFiller ? 'bg-indigo-400/30' : 'bg-orange-400/30';
                                                        const borderColor = isFiller ? 'border-indigo-300' : 'border-orange-300';
                                                        const anchorColor = isFiller ? 'bg-indigo-500' : 'bg-orange-500';

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className="absolute h-8 flex items-center group z-20 hover:z-[9999]"
                                                                style={{ left: `${left}px` }}
                                                                onMouseEnter={handleTooltipHover}
                                                            >
                                                                {/* Container for icon above + connector + anchor */}
                                                                <div className="relative flex flex-col items-center">
                                                                    {/* Icon positioned above the timeline */}
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                                                        <div className="relative">
                                                                            {/* Outer glow ring */}
                                                                            <div className={`absolute inset-0 ${glowColor} rounded-full blur-sm animate-pulse`} style={{ width: '28px', height: '28px', margin: '-2px' }} />
                                                                            {/* Main icon container */}
                                                                            <div className={`w-6 h-6 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg shadow-lg border-2 ${borderColor} flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer`}>
                                                                                {isFiller ? (
                                                                                    <Rocket className="w-3.5 h-3.5 text-white" />
                                                                                ) : (
                                                                                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                                                                                        <path d="M12 2C13.1 2 14 2.9 14 4C14 4.1 14 4.2 14 4.3C16.4 5.2 18 7.4 18 10V11H19C19.6 11 20 11.4 20 12S19.6 13 19 13H18V14C18 15.1 17.8 16.2 17.4 17.2L19.5 19.3C19.9 19.7 19.9 20.3 19.5 20.7C19.1 21.1 18.5 21.1 18.1 20.7L16.3 18.9C15.2 19.6 13.7 20 12 20C10.3 20 8.8 19.6 7.7 18.9L5.9 20.7C5.5 21.1 4.9 21.1 4.5 20.7C4.1 20.3 4.1 19.7 4.5 19.3L6.6 17.2C6.2 16.2 6 15.1 6 14V13H5C4.4 13 4 12.6 4 12S4.4 11 5 11H6V10C6 7.4 7.6 5.2 10 4.3C10 4.2 10 4.1 10 4C10 2.9 10.9 2 12 2ZM12 6C9.8 6 8 7.8 8 10V14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14V10C16 7.8 14.2 6 12 6ZM12 8C12.6 8 13 8.4 13 9V11C13 11.6 12.6 12 12 12C11.4 12 11 11.6 11 11V9C11 8.4 11.4 8 12 8Z" />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                            {!isFiller && (
                                                                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white flex items-center justify-center shadow-sm">
                                                                                    <svg viewBox="0 0 24 24" className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="4">
                                                                                        <path d="M5 12l5 5L20 7" />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Vertical connector line */}
                                                                    <div className={`absolute -top-7 left-1/2 -translate-x-1/2 w-0.5 h-7 bg-gradient-to-b ${gradientFrom.replace('from-', 'via-')} ${gradientTo.replace('to-', 'to-')}`} />

                                                                    {/* Anchor dot on the timeline */}
                                                                    <div className={`w-3 h-3 ${anchorColor} rounded-full border-2 border-white shadow-md`} />
                                                                </div>

                                                                {/* Tooltip */}
                                                                <div className={`invisible group-hover:visible absolute ${shouldFlipTooltip ? 'top-full mt-4' : 'bottom-full mb-12'} left-1/2 -translate-x-1/2 p-3 bg-ss-navy text-white rounded-lg shadow-xl z-[100] w-64 pointer-events-none before:content-[''] before:absolute ${shouldFlipTooltip ? 'before:bottom-full before:border-b-ss-navy' : 'before:top-full before:border-t-ss-navy'} before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent`}>
                                                                    <div className="text-sm font-bold mb-2 border-b border-blue-400/30 pb-1.5 text-center truncate">{item.name}</div>
                                                                    <div className="flex flex-col gap-2 text-xs">
                                                                        <div className="text-center">
                                                                            <div className={`${isFiller ? 'text-indigo-300' : 'text-orange-300'} font-bold uppercase tracking-widest opacity-70 text-[11px]`}>{item.phase}</div>
                                                                            <div className="font-medium whitespace-nowrap text-xs">{format(currentStartDate, 'MMM d, yyyy')}</div>
                                                                        </div>
                                                                        {isFiller && item.detailedStatus && (
                                                                            <div className="mt-1 text-xs text-blue-100 opacity-80 italic line-clamp-2">"{item.detailedStatus}"</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onMouseDown={(e) => handleDragStart(e, item, 'move')}
                                                            onMouseEnter={handleTooltipHover}
                                                            className={`absolute h-8 rounded-lg border flex items-center px-3 text-[10px] font-bold transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:z-[9999] ${colorClass} ${isDragging ? 'z-50 ring-2 ring-ss-primary shadow-lg scale-[1.02] opacity-90' : 'z-10'}`}
                                                            style={{ left: `${left}px`, width: `${width}px` }}
                                                        >
                                                            {/* Left Resize Handle */}
                                                            <div
                                                                onMouseDown={(e) => handleDragStart(e, item, 'resize-start')}
                                                                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-black/10 rounded-l-lg transition-colors z-20"
                                                            />

                                                            <span className="truncate pointer-events-none select-none w-full text-center relative z-10">
                                                                {item.name} <span className="opacity-60 font-medium text-[9px]">({item.phase})</span>
                                                            </span>

                                                            {item.type === 'release-dev' && (
                                                                <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden pr-2">
                                                                    {Array.from({ length: Math.ceil((differenceInDays(currentEndDate, currentStartDate) + 1) / 7) }).map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="flex-none h-full flex items-end pb-0.5 border-l border-current/10 first:border-l-0"
                                                                            style={{ width: `${dayWidth * 7}px` }}
                                                                        >
                                                                            <span className="text-[7px] font-black pl-1 opacity-30 uppercase tracking-tighter">
                                                                                W{i + 1}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Right Resize Handle */}
                                                            <div
                                                                onMouseDown={(e) => handleDragStart(e, item, 'resize-end')}
                                                                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-black/10 rounded-r-lg transition-colors z-20"
                                                            />

                                                            {/* Tooltip */}
                                                            <div className={`invisible group-hover:visible absolute ${shouldFlipTooltip ? 'top-full mt-4' : 'bottom-full mb-4'} left-1/2 -translate-x-1/2 p-3 bg-ss-navy text-white rounded-lg shadow-2xl z-[500] w-80 pointer-events-none before:content-[''] before:absolute ${shouldFlipTooltip ? 'before:bottom-full before:border-b-ss-navy' : 'before:top-full before:border-t-ss-navy'} before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent`}>
                                                                <div className="text-sm font-bold mb-2 border-b border-blue-400/30 pb-1.5 text-center truncate">{item.name}</div>
                                                                <div className="flex flex-col gap-2.5 text-xs">
                                                                    <div className="flex items-center justify-between bg-blue-900/40 px-2.5 py-1.5 rounded border border-blue-400/10 text-[10px]">
                                                                        <div className="flex gap-1 items-center">
                                                                            <span className="text-blue-300 opacity-50 uppercase font-bold tracking-tight text-[10px]">Start</span>
                                                                            <span className="font-bold text-[11px]">{format(currentStartDate, 'MMM d, yyyy')}</span>
                                                                        </div>
                                                                        <div className="flex gap-1 items-center ml-auto">
                                                                            <span className="text-blue-300 opacity-50 uppercase font-bold tracking-tight text-[10px]">End</span>
                                                                            <span className="font-bold text-[11px]">{format(currentEndDate, 'MMM d, yyyy')}</span>
                                                                        </div>
                                                                    </div>

                                                                    {item.detailedStatus && (
                                                                        <div className="space-y-1">
                                                                            <div className="text-blue-300 text-[10px] uppercase tracking-widest font-black opacity-80 text-center">Current Focus</div>
                                                                            <div className="text-xs italic text-blue-50 leading-relaxed bg-blue-900/40 p-2.5 rounded-lg border border-blue-400/10 text-left">
                                                                                "{item.detailedStatus}"
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {item.deliverables && item.deliverables.filter(d => d.status !== 'done').length > 0 && (
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between items-center relative">
                                                                                <div className="text-emerald-400 text-[10px] uppercase tracking-widest font-black opacity-80 w-full text-center">Next Deliverables</div>
                                                                                <div className="text-[10px] text-emerald-400/60 font-bold uppercase absolute right-0">[{item.deliverables.filter(d => d.status !== 'done').length}]</div>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                {item.deliverables
                                                                                    .filter(d => d.status !== 'done')
                                                                                    .slice(0, 5)
                                                                                    .map((d, i) => (
                                                                                        <div key={i} className="text-xs bg-white/5 p-2 rounded border border-white/10 flex justify-between items-center gap-2">
                                                                                            <span className="truncate flex-1 font-medium text-left">{d.name}</span>
                                                                                            {d.date && (
                                                                                                <span className="text-[10px] text-blue-300 font-bold whitespace-nowrap bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-400/20">
                                                                                                    {format(new Date(d.date), 'MMM d')}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mt-3 pt-2 border-t border-blue-400/20 text-[8px] text-blue-300 uppercase tracking-widest font-black text-center opacity-40">
                                                                    DRAG TO MOVE • EDGES TO RESIZE
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                        </div>{/* end Timeline Content */}
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default TimelineView;
