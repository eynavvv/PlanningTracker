import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Search, Trash2, GripVertical, ChevronRight, ChevronDown, Package, PartyPopper, Calendar } from 'lucide-react';
import { dataService } from '../services/dataService';
import NewInitiativeModal from '../components/NewInitiativeModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import TimelineView from '../components/TimelineView';

// dnd-kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Dropdown options based on user schema
const STATUS_OPTIONS = ['Initiative Planning', 'Release Planning', 'Development', 'Released'];
const PM_OPTIONS = ['Naama', 'Asaf', 'Sapir'];
const UX_OPTIONS = ['Tal', 'Maya', 'Naor'];
const GROUP_OPTIONS = ['Zebra', 'Pegasus'];
const RELEASE_STATUS_OPTIONS = ['Planning', 'Development', 'Released'];

const SortableInitiativeRow = ({
    init,
    handleFieldChange,
    handleReleasePhaseChange,
    STATUS_OPTIONS,
    PM_OPTIONS,
    UX_OPTIONS,
    GROUP_OPTIONS
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: init.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative'
    };

    return (
        <React.Fragment>
            <tr
                ref={setNodeRef}
                style={style}
                className={`hover:bg-slate-50 transition-colors ${isDragging ? 'bg-white shadow-lg opacity-80' : ''}`}
            >
                <td className="w-10 px-4">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                        {init.releasePlans?.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="w-5 h-5 min-w-[20px] min-h-[20px] bg-white border border-slate-300 shadow-sm rounded-full text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all flex items-center justify-center flex-shrink-0"
                                style={{ aspectRatio: '1/1', padding: '0' }}
                                title={isExpanded ? "Collapse" : "Expand Releases"}
                            >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        <div className="relative group w-fit max-w-full min-w-0">
                            <Link
                                to={`/plan/${encodeURIComponent(init.id)}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium truncate block"
                            >
                                {init.name}
                            </Link>

                            {/* Tooltip - show only if detailedStatus exists */}
                            {init.detailedStatus && (
                                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 p-3 bg-ss-navy text-white rounded-lg shadow-xl z-[100] w-72 pointer-events-none before:content-[''] before:absolute before:top-full before:left-6 before:border-8 before:border-transparent before:border-t-ss-navy">
                                    <div className="text-xs font-bold mb-2 border-b border-blue-400/30 pb-1 text-center truncate">{init.name}</div>
                                    <div className="text-blue-300 text-[9px] uppercase tracking-widest font-black mb-1 opacity-80">Current Focus</div>
                                    <div className="text-[10px] italic text-blue-50 leading-relaxed bg-blue-900/40 p-2 rounded-lg border border-blue-400/10">
                                        "{init.detailedStatus}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <select
                        value={init.status}
                        onChange={(e) => handleFieldChange(init.id, 'status', e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-full text-center border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all ${init.status === 'Initiative Planning' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            init.status === 'Release Planning' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                init.status === 'Development' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    init.status === 'Released' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4">
                    <select
                        value={init.pm || ''}
                        onChange={(e) => handleFieldChange(init.id, 'pm', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                    >
                        <option value="">Select PM</option>
                        {PM_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4">
                    <select
                        value={init.ux || ''}
                        onChange={(e) => handleFieldChange(init.id, 'ux', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                    >
                        <option value="">Select UX</option>
                        {UX_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4">
                    <select
                        value={init.group || ''}
                        onChange={(e) => handleFieldChange(init.id, 'group', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600"
                    >
                        <option value="">Select Group</option>
                        {GROUP_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4">
                    <input
                        value={init.techLead || ''}
                        title={init.techLead || ''}
                        onChange={(e) => handleFieldChange(init.id, 'techLead', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600 truncate"
                        placeholder="Lead"
                    />
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                    <input
                        value={Array.isArray(init.developers) ? init.developers.join(', ') : init.developers || ''}
                        title={Array.isArray(init.developers) ? init.developers.join(', ') : init.developers || ''}
                        onChange={(e) => handleFieldChange(init.id, 'developers', e.target.value.split(',').map(d => d.trim()))}
                        className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full text-slate-600 truncate"
                        placeholder="Devs..."
                    />
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs text-right">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteInitiative(init.id, init.name);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete Initiative"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
            </tr>
            {
                isExpanded && !isDragging && init.releasePlans?.map(rp => (
                    <tr key={rp.id} className="bg-blue-50/30 border-l-4 border-l-blue-400 transition-colors border-b border-slate-100/50">
                        <td className="px-4"></td>
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-2 pl-6">
                                <Package className="w-3.5 h-3.5 text-blue-400" />
                                <Link
                                    to={`/plan/${encodeURIComponent(init.id)}?view=release_plans#release-${rp.id}`}
                                    className="text-slate-600 font-medium text-xs hover:text-blue-600 hover:underline transition-colors truncate"
                                    title={rp.goal}
                                >
                                    {rp.goal}
                                </Link>
                            </div>
                        </td>
                        <td className="px-6 py-3">
                            <select
                                value={rp.status}
                                onChange={(e) => handleReleasePhaseChange(init.id, rp.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-full text-center border focus:ring-2 focus:ring-blue-400 outline-none transition-all ${rp.status === 'Planning' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                    rp.status === 'Development' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        rp.status === 'Released' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}
                            >
                                {RELEASE_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </td>
                        <td className="px-6 py-3" colSpan={6}>
                            <div className="flex items-center gap-4 whitespace-nowrap">
                                {rp.status === 'Planning' && rp.planning_end_date && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-bold bg-purple-50/50 px-3 py-1.5 rounded-full border border-purple-100/50 uppercase tracking-tight">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Target: {format(new Date(rp.planning_end_date), 'MMM d, yyyy')}</span>
                                    </div>
                                )}

                                {rp.status === 'Development' && rp.dev_end_date && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-bold bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-100/50 uppercase tracking-tight">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Target: {format(new Date(rp.dev_end_date), 'MMM d, yyyy')}</span>
                                    </div>
                                )}

                                {rp.status === 'Released' && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold bg-emerald-50/50 px-3 py-1.5 rounded-full border border-emerald-100/50 uppercase tracking-tight animate-bounce">
                                        <PartyPopper className="w-3.5 h-3.5" />
                                        <span>Liftoff! 🎉</span>
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                ))
            }
        </React.Fragment >
    );
};

const Dashboard = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
    const navigate = useNavigate();
    const syncTimeoutRef = useRef({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadInitiatives();
    }, []);

    const loadInitiatives = async () => {
        try {
            setIsLoading(true);

            if (!dataService.isConfigured()) {
                setInitiatives([
                    { id: '1', name: 'Demo Initiative', status: 'Initiative Planning', pm: 'Naama', ux: 'Tal', group: 'Zebra', techLead: 'John', developers: ['Alice', 'Bob'] },
                ]);
                setIsLoading(false);
                return;
            }

            const releases = await dataService.getDashboardTimelineData();
            setInitiatives(releases);
        } catch (err) {
            console.error("Failed to load initiatives:", err);
            setError("Failed to load initiatives. Please check your Supabase configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced sync to sheet
    const debouncedSync = useCallback((initiativeId, field, value) => {
        if (syncTimeoutRef.current[initiativeId]) {
            clearTimeout(syncTimeoutRef.current[initiativeId]);
        }

        syncTimeoutRef.current[initiativeId] = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;

                await dataService.updateInitiative(initiativeId, { [field]: value });
            } catch (err) {
                console.error('Failed to sync to database:', err);
            }
        }, 1000);
    }, [initiatives]);

    const handleFieldChange = (id, field, value) => {
        setInitiatives(prev => prev.map(init =>
            init.id === id ? { ...init, [field]: value } : init
        ));
        debouncedSync(id, field, value);
    };

    const handleReleasePhaseChange = async (initiativeId, releaseId, newStatus) => {
        // Optimistic update
        setInitiatives(prev => prev.map(init => {
            if (init.id === initiativeId) {
                return {
                    ...init,
                    releasePlans: init.releasePlans.map(rp =>
                        rp.id === releaseId ? { ...rp, status: newStatus } : rp
                    )
                };
            }
            return init;
        }));

        try {
            if (dataService.isConfigured()) {
                await dataService.updateReleasePlan(initiativeId, releaseId, { status: newStatus });
            }
        } catch (err) {
            console.error('Failed to update release status:', err);
            loadInitiatives(); // Rollback
        }
    };

    const handleCreateInitiative = async (name) => {
        try {
            const result = await dataService.createInitiative(name);
            navigate(`/plan/${result.id}`);
        } catch (err) {
            console.error('Failed to create initiative:', err);
            throw err;
        }
    };
    const handleDeleteInitiative = async (id, name) => {
        setDeleteModal({
            isOpen: true,
            item: { id, name }
        });
    };

    const confirmDelete = async () => {
        const { id } = deleteModal.item;
        try {
            if (dataService.isConfigured()) {
                await dataService.deleteInitiative(id);
            }
            setInitiatives(prev => prev.filter(init => init.id !== id));
        } catch (err) {
            console.error('Failed to delete initiative:', err);
            alert('Failed to delete initiative. Please check your database connection.');
        }
    };
    const handleTimelineUpdate = async (item, newStartDate, newEndDate) => {
        try {
            const updates = {};
            const startDateStr = format(newStartDate, 'yyyy-MM-dd');
            const endDateStr = format(newEndDate, 'yyyy-MM-dd');

            if (item.type === 'initiative-planning') {
                await dataService.updateInitialPlanning(item.initiativeId, {
                    StartDate: startDateStr,
                    PlannedEndDate: endDateStr
                });
            } else if (item.type === 'release-planning') {
                await dataService.updateReleasePlan(item.initiativeId, item.releaseId, {
                    planningStartDate: startDateStr,
                    planningEndDate: endDateStr
                });
            } else if (item.type === 'release-dev') {
                await dataService.updateReleasePlan(item.initiativeId, item.releaseId, {
                    devStartDate: startDateStr,
                    devEndDate: endDateStr
                });
            }

            // Optimistic update
            setInitiatives(prev => prev.map(init => {
                if (init.id === item.initiativeId) {
                    if (item.type === 'initiative-planning') {
                        return {
                            ...init,
                            initialPlanning: {
                                ...init.initialPlanning,
                                start_date: startDateStr,
                                planned_end_date: endDateStr
                            }
                        };
                    } else {
                        return {
                            ...init,
                            releasePlans: init.releasePlans.map(rp => {
                                if (rp.id === item.releaseId) {
                                    if (item.type === 'release-planning') {
                                        return { ...rp, planning_start_date: startDateStr, planning_end_date: endDateStr };
                                    } else {
                                        return { ...rp, dev_start_date: startDateStr, dev_end_date: endDateStr };
                                    }
                                }
                                return rp;
                            })
                        };
                    }
                }
                return init;
            }));
        } catch (err) {
            console.error("Failed to update date from timeline:", err);
            loadInitiatives(); // Rollback on error
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setInitiatives((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newOrderedItems = arrayMove(items, oldIndex, newIndex);

                // Save new order to database
                if (dataService.isConfigured()) {
                    dataService.updateInitiativeOrder(newOrderedItems.map(i => i.id))
                        .catch(err => console.error("Failed to sync new order:", err));
                }

                return newOrderedItems;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 font-medium">Loading Initiatives...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <img src="/logo.png" alt="SundaySky" className="h-16 w-auto" />
                    <div>
                        <h1 className="text-3xl font-bold text-ss-navy">Initiatives Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage and track all strategic initiatives.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-ss-primary hover:bg-ss-action text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Initiative</span>
                </button>
            </div>

            <TimelineView data={initiatives} onUpdateItem={handleTimelineUpdate} />

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="w-10"></th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[25%]">Initiative Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[200px]">Phase</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[80px]">PM</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[80px]">UX</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[100px]">Group</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[100px]">Tech Lead</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-[120px]">Developers</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-10"></th>
                            </tr>
                        </thead>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={initiatives.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody className="divide-y divide-slate-100">
                                    {initiatives.map((init) => (
                                        <SortableInitiativeRow
                                            key={init.id}
                                            init={init}
                                            handleFieldChange={handleFieldChange}
                                            handleReleasePhaseChange={handleReleasePhaseChange}
                                            handleDeleteInitiative={handleDeleteInitiative}
                                            STATUS_OPTIONS={STATUS_OPTIONS}
                                            PM_OPTIONS={PM_OPTIONS}
                                            UX_OPTIONS={UX_OPTIONS}
                                            GROUP_OPTIONS={GROUP_OPTIONS}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </DndContext>
                    </table>
                </div>
            </div>

            <NewInitiativeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateInitiative}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, item: null })}
                onConfirm={confirmDelete}
                title="Delete Initiative"
                message="Are you sure you want to delete this initiative? All associated planning data, release plans, and epics will be permanently removed."
                itemName={deleteModal.item?.name}
            />
        </div>
    );
};

export default Dashboard;
