import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Target, Plus } from 'lucide-react';
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
    const [isInitiativesCollapsed, setIsInitiativesCollapsed] = useState(false);
    const [isRoadmapFillersCollapsed, setIsRoadmapFillersCollapsed] = useState(false);
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
        debouncedSync(id, field, value);
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

    return (
        <div className="space-y-8">
            <DashboardHeader />

            <TimelineView data={initiatives} onUpdateItem={handleTimelineUpdate} />

            {/* Filter and search hidden for now
            <InitiativeFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onToggleArrayFilter={toggleArrayFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                options={{
                    status: STATUS_OPTIONS,
                    pm: PM_OPTIONS,
                    ux: UX_OPTIONS,
                    group: GROUP_OPTIONS,
                }}
            />
            */}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {/* Initiatives Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Collapsible Header */}
                <button
                    onClick={() => setIsInitiativesCollapsed(!isInitiativesCollapsed)}
                    className="w-full px-6 py-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">Initiatives</h2>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {initiatives.length} ITEMS
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs font-medium">{isInitiativesCollapsed ? 'Expand' : 'Collapse'}</span>
                        {isInitiativesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                </button>

                {/* Collapsible Content */}
                {!isInitiativesCollapsed && (
                    <>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="overflow-x-auto">
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
                                                        <p>No initiatives yet. Create your first one!</p>
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
                            </div>
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
                    </>
                )}
            </div>

            {/* Roadmap Fillers Section */}
            <RoadmapFillers
                tasks={tasks}
                onAddTask={() => setIsTaskModalOpen(true)}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onReorderTasks={handleReorderTasks}
                isCollapsed={isRoadmapFillersCollapsed}
                onToggleCollapse={() => setIsRoadmapFillersCollapsed(!isRoadmapFillersCollapsed)}
            />

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
