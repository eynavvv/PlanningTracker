import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Target, Plus, Calendar, Rocket } from 'lucide-react';
import { dataService } from '../services/dataService';
import NewInitiativeModal from '../components/NewInitiativeModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import TimelineView from '../components/TimelineView';
import { DashboardHeader, SortableInitiativeRow, InitiativeFilters, RoadmapFillers, STATUS_OPTIONS, PM_OPTIONS, UX_OPTIONS, GROUP_OPTIONS } from '../components/dashboard';
import { AddTaskModal } from '../components/AddTaskModal';
import { DashboardSkeleton } from '../components/skeletons';
import { useFilters } from '../hooks/useFilters';

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
} from '@dnd-kit/sortable';

const Dashboard = () => {
    const [initiatives, setInitiatives] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: 'initiative' });
    const [tasks, setTasks] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('timeline');
    const [highlightedFillerId, setHighlightedFillerId] = useState(null);
    const navigate = useNavigate();
    const syncTimeoutRef = useRef({});

    // Use the filter hook for search and filtering
    const {
        filters,
        filteredItems,
        hasActiveFilters,
        updateFilter,
        toggleArrayFilter,
        clearFilters,
    } = useFilters(initiatives, {
        searchFields: ['name', 'techLead'],
    });

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
        loadTasks();

        // Listen for real-time updates from other users
        const handleRemoteUpdate = (event) => {
            const table = event.detail?.table;
            console.log(`Real-time update received for: ${table}`);

            // Refresh relevant data based on table
            if (table === 'tasks') {
                loadTasks();
            } else {
                // For initiatives, release plans, etc.
                loadInitiatives();
            }
        };

        window.addEventListener('supabase-update', handleRemoteUpdate);
        return () => window.removeEventListener('supabase-update', handleRemoteUpdate);
    }, []);

    const loadTasks = async () => {
        try {
            if (!dataService.isConfigured()) {
                setTasks([]);
                return;
            }
            const tasksData = await dataService.getTasks();
            setTasks(tasksData);
        } catch (err) {
            console.error("Failed to load tasks:", err);
        }
    };

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
    }, []);

    const handleFieldChange = (id, field, value) => {
        setInitiatives(prev => prev.map(init =>
            init.id === id ? { ...init, [field]: value } : init
        ));

        if (field === 'status' || field === 'Status') {
            // Immediate sync for status
            if (dataService.isConfigured()) {
                dataService.updateInitiative(id, { [field]: value })
                    .catch(err => console.error('Failed to sync to database:', err));
            }
        } else {
            debouncedSync(id, field, value);
        }
    };

    const handleReleasePhaseChange = async (initiativeId, releaseId, newStatus) => {
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
            loadInitiatives();
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
            item: { id, name },
            type: 'initiative'
        });
    };

    // Task handlers
    const handleCreateTask = async (taskData) => {
        try {
            const newTask = await dataService.createTask(taskData);
            setTasks(prev => [...prev, newTask]);
        } catch (err) {
            console.error('Failed to create task:', err);
            throw err;
        }
    };

    const handleDeleteTask = (id, name) => {
        setDeleteModal({
            isOpen: true,
            item: { id, name },
            type: 'task'
        });
    };

    const handleUpdateTask = async (id, field, value) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, [field]: value } : task
        ));

        try {
            if (dataService.isConfigured()) {
                await dataService.updateTask(id, { [field]: value });
            }
        } catch (err) {
            console.error('Failed to update task:', err);
            loadTasks();
        }
    };

    const handleReorderTasks = async (orderedIds) => {
        const newOrderedTasks = orderedIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
        setTasks(newOrderedTasks);

        try {
            if (dataService.isConfigured()) {
                await dataService.updateTaskOrder(orderedIds);
            }
        } catch (err) {
            console.error('Failed to update task order:', err);
            loadTasks();
        }
    };

    const confirmDelete = async () => {
        const { id } = deleteModal.item;
        const { type } = deleteModal;

        try {
            if (type === 'task') {
                if (dataService.isConfigured()) {
                    await dataService.deleteTask(id);
                }
                setTasks(prev => prev.filter(task => task.id !== id));
            } else {
                if (dataService.isConfigured()) {
                    await dataService.deleteInitiative(id);
                }
                setInitiatives(prev => prev.filter(init => init.id !== id));
            }
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            alert(`Failed to delete ${type}. Please check your database connection.`);
        }
    };

    const handleTimelineUpdate = async (item, newStartDate, newEndDate) => {
        try {
            const startDateStr = format(newStartDate, 'yyyy-MM-dd');
            const endDateStr = format(newEndDate, 'yyyy-MM-dd');

            if (item.type === 'initiative-planning') {
                await dataService.updateInitialPlanning(item.initiativeId, {
                    StartDate: startDateStr,
                    PlannedEndDate: endDateStr
                });
            } else if (item.type === 'release-pre-planning') {
                await dataService.updateReleasePlan(item.initiativeId, item.releaseId, {
                    prePlanningStartDate: startDateStr,
                    prePlanningEndDate: endDateStr
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
            } else if (item.type === 'qa-event') {
                await dataService.updateReleasePlan(item.initiativeId, item.releaseId, {
                    qaEventDate: startDateStr
                });
            } else if (item.type === 'roadmap-filler') {
                await dataService.updateTask(item.fillerId, { target_date: startDateStr });
            }

            if (item.type === 'roadmap-filler') {
                setTasks(prev => prev.map(task =>
                    task.id === item.fillerId ? { ...task, target_date: startDateStr } : task
                ));
                return;
            }

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
                                    if (item.type === 'release-pre-planning') {
                                        return { ...rp, pre_planning_start_date: startDateStr, pre_planning_end_date: endDateStr };
                                    } else if (item.type === 'release-planning') {
                                        return { ...rp, planning_start_date: startDateStr, planning_end_date: endDateStr };
                                    } else if (item.type === 'qa-event') {
                                        return { ...rp, qa_event_date: startDateStr };
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
            loadInitiatives();
        }
    };

    const handleFillerClick = (fillerId) => {
        setActiveTab('roadmap');
        setHighlightedFillerId(fillerId);
        setTimeout(() => setHighlightedFillerId(null), 2500);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setInitiatives((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newOrderedItems = arrayMove(items, oldIndex, newIndex);

                if (dataService.isConfigured()) {
                    dataService.updateInitiativeOrder(newOrderedItems.map(i => i.id))
                        .catch(err => console.error("Failed to sync new order:", err));
                }

                return newOrderedItems;
            });
        }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const TABS = [
        { key: 'timeline', label: 'Timeline', icon: Calendar },
        { key: 'initiatives', label: 'Initiatives', icon: Target },
        { key: 'roadmap', label: 'Roadmap Fillers', icon: Rocket },
    ];

    return (
        <div className="flex flex-col gap-0">
            <DashboardHeader />

            {/* Tab Bar */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                            activeTab === key
                                ? 'text-ss-primary dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-6">

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
                <TimelineView
                    data={initiatives}
                    roadmapFillers={tasks}
                    onUpdateItem={handleTimelineUpdate}
                    onFillerClick={handleFillerClick}
                    defaultExpanded={true}
                    fullPage={true}
                />
            )}

            {/* Initiatives Tab */}
            {activeTab === 'initiatives' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="w-10"></th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 w-[30%]">Initiative Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 w-[200px]">Phase</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 w-[150px]">Target Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 w-[100px]">Group</th>
                                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 w-10"></th>
                                </tr>
                            </thead>
                            <SortableContext
                                items={initiatives.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {initiatives.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                No initiatives yet. Create your first one!
                                            </td>
                                        </tr>
                                    ) : (
                                        initiatives.map((init) => (
                                            <SortableInitiativeRow
                                                key={init.id}
                                                init={init}
                                                handleFieldChange={handleFieldChange}
                                                handleReleasePhaseChange={handleReleasePhaseChange}
                                                handleDeleteInitiative={handleDeleteInitiative}
                                                STATUS_OPTIONS={STATUS_OPTIONS}
                                                GROUP_OPTIONS={GROUP_OPTIONS}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Initiative
                        </button>
                    </div>
                </div>
            )}

            {/* Roadmap Fillers Tab */}
            {activeTab === 'roadmap' && (
                <RoadmapFillers
                    tasks={tasks}
                    onAddTask={() => setIsTaskModalOpen(true)}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                    onReorderTasks={handleReorderTasks}
                    isCollapsed={false}
                    onToggleCollapse={() => {}}
                    highlightedTaskId={highlightedFillerId}
                />
            )}

            </div>{/* end tab content */}

            <NewInitiativeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateInitiative}
            />

            <AddTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleCreateTask}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, item: null, type: 'initiative' })}
                onConfirm={confirmDelete}
                title={deleteModal.type === 'task' ? 'Delete Task' : 'Delete Initiative'}
                message={deleteModal.type === 'task'
                    ? 'Are you sure you want to delete this task? This action cannot be undone.'
                    : 'Are you sure you want to delete this initiative? All associated planning data, release plans, and epics will be permanently removed.'}
                itemName={deleteModal.item?.name}
            />
        </div>
    );
};

export default Dashboard;
