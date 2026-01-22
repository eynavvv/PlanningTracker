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
import { ChevronDown, ChevronUp, Calendar, Info, Clock, Layers } from 'lucide-react';

const TimelineView = ({ data, onUpdateItem }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null); // { id, deltaDays, originalStartDate, originalEndDate }
    const scrollContainerRef = useRef(null);

    // Process data into timeline items
    const timelineItems = useMemo(() => {
        const items = [];
        if (!data) return items;

        data.forEach(initiative => {
            // 1. Initiative Initial Planning
            if (initiative.initialPlanning?.start_date && initiative.initialPlanning?.planned_end_date) {
                items.push({
                    id: `init-plan-${initiative.id}`,
                    name: initiative.name,
                    phase: 'Initial Planning',
                    startDate: new Date(initiative.initialPlanning.start_date),
                    endDate: new Date(initiative.initialPlanning.planned_end_date),
                    type: 'initiative-planning',
                    initiativeName: initiative.name,
                    initiativeId: initiative.id
                });
            }

            // 2. Release Phases
            initiative.releasePlans?.forEach(rp => {
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
                        releaseId: rp.id
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
                        releaseId: rp.id
                    });
                }
            });
        });

        return items.sort((a, b) => a.startDate - b.startDate);
    }, [data]);

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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-3 flex justify-between items-center bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-ss-primary" />
                    <h2 className="font-bold text-ss-navy">Release Timeline</h2>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {timelineItems.length} PHASES
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-medium">{isExpanded ? 'Collapse' : 'Expand Timeline'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {isExpanded && (
                <div
                    ref={scrollContainerRef}
                    className="p-4 overflow-x-auto custom-scrollbar bg-white"
                >
                    <div
                        className="relative pt-10 pb-6"
                        style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
                    >
                        {/* Month Headers */}
                        {monthMarkers.map((m, idx) => (
                            <div
                                key={`month-${idx}`}
                                className="absolute top-0 border-l border-slate-200 h-full"
                                style={{ left: `${m.left}px` }}
                            >
                                <span className="absolute top-0 left-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                                    {m.label}
                                </span>
                            </div>
                        ))}

                        {/* Week Alternating Backgrounds */}
                        {weekMarkers.map((w, idx) => (
                            idx % 2 === 0 && (
                                <div
                                    key={`week-bg-${idx}`}
                                    className="absolute top-6 bottom-0 bg-slate-50 opacity-40 -z-10"
                                    style={{ left: `${w.left}px`, width: `${w.width}px` }}
                                />
                            )
                        ))}

                        {/* Week Markers */}
                        {weekMarkers.map((w, idx) => (
                            <div
                                key={`week-${idx}`}
                                className="absolute top-6 border-l border-slate-200 h-full z-0"
                                style={{ left: `${w.left}px` }}
                            >
                                <span className="absolute top-0 left-1 text-[8px] font-black text-slate-400 whitespace-nowrap bg-white/80 px-1 rounded">
                                    {w.label}
                                </span>
                            </div>
                        ))}

                        {/* Today Line */}
                        {todayPos !== null && (
                            <div
                                className="absolute top-0 bottom-0 border-l-2 border-ss-action z-10 before:content-[''] before:absolute before:top-0 before:-left-1 before:w-2 before:h-2 before:bg-ss-action before:rounded-full"
                                style={{ left: `${todayPos}px` }}
                                title="Today"
                            >
                                <span className="absolute top-1 -left-4 -translate-x-full text-[8px] font-black text-ss-action bg-white px-1 shadow-sm border border-ss-action/20">TODAY</span>
                            </div>
                        )}

                        {/* Bars */}
                        <div className="flex flex-col gap-6 mt-8 relative z-0">
                            {Object.entries(initiativeRows).map(([name, items], rowIdx) => {
                                // Strict grouping: Initial Plan on row 0, then one row per Release
                                const subRows = [];

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

                                // Merge Initial Planning with First Release
                                if (sortedReleaseGroups.length > 0) {
                                    // Row 0: Initial Planning + 1st Release
                                    subRows.push([...initItems, ...sortedReleaseGroups[0]]);

                                    // Subsequent Rows: Remaining Releases
                                    sortedReleaseGroups.slice(1).forEach(group => subRows.push(group));
                                } else if (initItems.length > 0) {
                                    // If no releases, just show Initial Planning
                                    subRows.push(initItems);
                                }

                                return (
                                    <div key={name} className="relative flex flex-col gap-2 border-b border-slate-50 pb-2">
                                        <div className="sticky left-0 z-10 flex items-center gap-2 mb-3 pl-0 py-1 w-fit max-w-[calc(100vw-300px)]">
                                            {/* Decorative Background for legibility when scrolling */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent -z-10 rounded-r-xl" />

                                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                                <Layers className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                                                    {name}
                                                </h3>
                                                <div className="h-px bg-slate-200 w-12 self-center opacity-50" />
                                            </div>
                                        </div>

                                        {subRows.map((rowItems, subRowIdx) => (
                                            <div key={`${name}-subrow-${subRowIdx}`} className="relative h-8 w-full">
                                                {rowItems.map(item => {
                                                    const isDragging = draggingItem?.id === item.id;
                                                    const currentStartDate = isDragging ? draggingItem.tempStartDate : item.startDate;
                                                    const currentEndDate = isDragging ? draggingItem.tempEndDate : item.endDate;
                                                    const left = getPosition(currentStartDate);
                                                    const width = getWidth(currentStartDate, currentEndDate);

                                                    const colorClass =
                                                        item.type === 'initiative-planning' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' :
                                                            item.type === 'release-planning' ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' :
                                                                'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onMouseDown={(e) => handleDragStart(e, item, 'move')}
                                                            className={`absolute h-8 rounded-lg border flex items-center px-3 text-[10px] font-bold transition-all cursor-grab active:cursor-grabbing group shadow-sm ${colorClass} ${isDragging ? 'z-50 ring-2 ring-ss-primary shadow-lg scale-[1.02] opacity-90' : 'z-10'}`}
                                                            style={{ left: `${left}px`, width: `${width}px` }}
                                                        >
                                                            {/* Left Resize Handle */}
                                                            <div
                                                                onMouseDown={(e) => handleDragStart(e, item, 'resize-start')}
                                                                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-black/10 rounded-l-lg transition-colors z-20"
                                                            />

                                                            <span className="truncate pointer-events-none select-none w-full text-center">
                                                                {item.name} <span className="opacity-60 font-medium text-[9px]">({item.phase})</span>
                                                            </span>

                                                            {/* Right Resize Handle */}
                                                            <div
                                                                onMouseDown={(e) => handleDragStart(e, item, 'resize-end')}
                                                                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-black/10 rounded-r-lg transition-colors z-20"
                                                            />

                                                            {/* Tooltip */}
                                                            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-ss-navy text-white rounded-lg shadow-xl z-50 w-64 pointer-events-none">
                                                                <div className="text-xs font-bold mb-1 border-b border-blue-400/30 pb-1 text-center">{item.name}</div>
                                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                    <div>
                                                                        <div className="text-blue-300">Phase</div>
                                                                        <div>{item.phase}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-blue-300">Initiative</div>
                                                                        <div className="truncate">{item.initiativeName}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-blue-300">Start</div>
                                                                        <div>{format(currentStartDate, 'EEE, MMM d, yyyy')}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-blue-300">End</div>
                                                                        <div>{format(currentEndDate, 'EEE, MMM d, yyyy')}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 pt-2 border-t border-blue-400/20 text-[8px] text-blue-300 uppercase tracking-widest font-black text-center">
                                                                    DRAG CENTER TO MOVE • EDGES TO RESIZE
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineView;
