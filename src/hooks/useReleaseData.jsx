import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dataService } from '../services/dataService.js';

const initialData = {
    Initiative: {
        Name: "",
        Status: "",
        PM: "",
        UX: "",
        Group: "",
        TechLead: "",
        Developers: [],
        detailedStatus: "",
        deliverables: [],
        InitialPlanning: {
            StartDate: new Date().toISOString().split('T')[0],
            PlannedEndDate: new Date().toISOString().split('T')[0],
            Status: "",
            PRD: "",
            Figma: "",
            ReleasePlanSummary: ""
        },
        ReleasePlan: []
    },
    planningSteps: [
        { id: 1, activity: "Kickoff Meeting: Epic Review 👥", owner: "PM", expectedDuration: "1 hour", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Highlighted Issues/Risks Doc" },
        { id: 2, activity: "Immediate Use-Case Feedback", owner: "R&D", expectedDuration: "0.5 days", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Initial Technical Assessment" },
        { id: 3, activity: "Mature Flows (Wireframe/Spec Refinement)", owner: "PM, UX", expectedDuration: "2-3 days", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Matured Flow Document/Spec" },
        { id: 4, activity: "Meeting: Flow Review & Gap Identification 👥", owner: "All Teams", expectedDuration: "2 hours", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Formal Gap Identification Log" },
        { id: 5, activity: "Finalize Design & Acceptance Criteria", owner: "PM, UX", expectedDuration: "Up to 3 days", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Final Figma (with draft ACs)" },
        { id: 6, activity: "Final Figma Review (1 Day per Epic)", owner: "R&D", expectedDuration: "1-4 days", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Technical Feasibility Sign-off" },
        { id: 7, activity: "Meeting: Final Issue & Gap Closure 👥", owner: "All Teams", expectedDuration: "Up to 1 day", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Issue Closure Log" },
        { id: 8, activity: "Story Breakdown (Ready for Dev)", owner: "R&D", expectedDuration: "1 hour per epic", actualDuration: "", dateCompleted: "", status: "pending", artifact: "Stories in JIRA/Tool" }
    ]
};

const ReleaseContext = React.createContext(null);

export function ReleaseProvider({ children, planId }) {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const syncTimeoutRef = useRef({});
    const releaseMetadataRef = useRef(null);

    useEffect(() => {
        if (!planId) return;
        loadReleaseData();
    }, [planId]);

    const loadReleaseData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!dataService.isConfigured()) {
                setData(initialData);
                setIsLoading(false);
                return;
            }

            try {
                const sheetData = await dataService.getRelease(planId);
                const loadedData = {
                    Initiative: {
                        id: planId,
                        Name: sheetData.Initiative.name,
                        Status: sheetData.Initiative.status || "",
                        PM: sheetData.Initiative.pm || "",
                        UX: sheetData.Initiative.ux || "",
                        Group: sheetData.Initiative.group || "",
                        TechLead: sheetData.Initiative.techLead || "",
                        Developers: sheetData.Initiative.developers || [],
                        detailedStatus: sheetData.Initiative.detailedStatus || "",
                        deliverables: [], // Will load separately for better handling
                        InitialPlanning: sheetData.Initiative.InitialPlanning,
                        ReleasePlan: sheetData.Initiative.ReleasePlan
                    },
                    planningSteps: initialData.planningSteps
                };

                // Load deliverables
                const deliverables = await dataService.getDeliverables(planId);
                loadedData.Initiative.deliverables = deliverables;

                setData(loadedData);
            } catch (err) {
                console.error('Error loading from database:', err);
                setError('Could not find this initiative in the database.');
            }
        } catch (err) {
            console.error('Failed to load release data:', err);
            setError(err.message || 'Failed to load release data');
        } finally {
            setIsLoading(false);
        }
    };

    const updateInitiativeMeta = (field, value) => {
        setData(prev => ({
            ...prev,
            Initiative: { ...prev.Initiative, [field]: value }
        }));

        if (syncTimeoutRef.current.meta) {
            clearTimeout(syncTimeoutRef.current.meta);
        }

        syncTimeoutRef.current.meta = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;
                await dataService.updateInitiative(planId, { [field]: value });
            } catch (err) {
                console.error('Failed to sync initiative metadata:', err);
            }
        }, 1000);
    };

    const updateInitialPlanning = useCallback((field, value) => {
        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                InitialPlanning: {
                    ...prev.Initiative.InitialPlanning,
                    [field]: value
                }
            }
        }));

        if (syncTimeoutRef.current.initialPlanning) {
            clearTimeout(syncTimeoutRef.current.initialPlanning);
        }

        syncTimeoutRef.current.initialPlanning = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;
                await dataService.updateInitialPlanning(planId, { [field]: value });
            } catch (err) {
                console.error('Failed to sync initial planning:', err);
            }
        }, 1000);
    }, [planId]);

    const updateReleasePlan = useCallback((planIndex, field, value) => {
        const plan = data.Initiative.ReleasePlan[planIndex];
        if (!plan) return;

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((p, idx) =>
                    idx === planIndex ? { ...p, [field]: value } : p
                )
            }
        }));

        const key = `releasePlan_${plan.id}`;
        if (syncTimeoutRef.current[key]) {
            clearTimeout(syncTimeoutRef.current[key]);
        }

        syncTimeoutRef.current[key] = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;
                await dataService.updateReleasePlan(planId, plan.id, { [field]: value });
            } catch (err) {
                console.error('Failed to sync release plan:', err);
            }
        }, 1000);
    }, [planId, data.Initiative.ReleasePlan]);

    const updateEpic = useCallback((planIndex, epicIndex, field, value) => {
        const plan = data.Initiative.ReleasePlan[planIndex];
        const epic = plan?.Epics[epicIndex];
        if (!epic) return;

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((p, pIdx) =>
                    pIdx === planIndex ? {
                        ...p,
                        Epics: p.Epics.map((e, eIdx) =>
                            eIdx === epicIndex ? { ...e, [field]: value } : e
                        )
                    } : p
                )
            }
        }));

        const key = `epic_${epic.id}`;
        if (syncTimeoutRef.current[key]) {
            clearTimeout(syncTimeoutRef.current[key]);
        }

        syncTimeoutRef.current[key] = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;
                await dataService.updateEpic(planId, epic.id, { [field]: value });
            } catch (err) {
                console.error('Failed to sync epic:', err);
            }
        }, 1000);
    }, [planId, data.Initiative.ReleasePlan]);

    const addReleasePlan = useCallback(async (name) => {
        const newIndex = data.Initiative.ReleasePlan.length;
        const newId = (newIndex + 1).toString();

        const today = new Date().toISOString().split('T')[0];
        const newPlan = {
            id: newId,
            goal: name,
            status: 'Planning',
            planningStartDate: today,
            planningEndDate: today,
            devStartDate: today,
            devEndDate: today,
            loe: '',
            reqDoc: '',
            devs: '',
            devPlan: '',
            internalReleaseDate: '',
            externalReleaseDate: '',
            Epics: []
        };

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: [...prev.Initiative.ReleasePlan, newPlan]
            }
        }));

        try {
            if (dataService.isConfigured()) {
                const dbPlan = await dataService.createReleasePlan(planId, name);

                // Update local state with the real database ID
                setData(prev => ({
                    ...prev,
                    Initiative: {
                        ...prev.Initiative,
                        ReleasePlan: prev.Initiative.ReleasePlan.map(p =>
                            p.id === newId ? { ...p, id: dbPlan.id } : p
                        )
                    }
                }));
            }
        } catch (err) {
            console.error('Failed to add release plan:', err);
            // Optionally remove the optimistic plan on failure
        }
    }, [data.Initiative.ReleasePlan, planId]);

    const addEpic = useCallback(async (planIndex, name) => {
        // Calculate global epic new index
        let currentTotalEpics = 0;
        data.Initiative.ReleasePlan.forEach(p => {
            if (p.Epics) currentTotalEpics += p.Epics.length;
        });

        const targetPlan = data.Initiative.ReleasePlan[planIndex];
        const targetReleaseId = targetPlan ? targetPlan.id : '';

        // Add to local state
        const newEpic = {
            id: `new-${Date.now()}`,
            releaseId: targetReleaseId,
            Name: name,
            Status: 'Pending',
            Link: '',
            loe: '',
            ac: '',
            figma: '',
            description: ''
        };

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((plan, idx) =>
                    idx === planIndex ? { ...plan, Epics: [...(plan.Epics || []), newEpic] } : plan
                )
            }
        }));

        try {
            if (dataService.isConfigured()) {
                const dbEpic = await dataService.createEpic(planId, targetReleaseId, name);

                // Update local state with the real database ID
                setData(prev => ({
                    ...prev,
                    Initiative: {
                        ...prev.Initiative,
                        ReleasePlan: prev.Initiative.ReleasePlan.map((plan, idx) =>
                            idx === planIndex ? {
                                ...plan,
                                Epics: plan.Epics.map(e => e.id === newEpic.id ? { ...e, id: dbEpic.id } : e)
                            } : plan
                        )
                    }
                }));
            }
        } catch (err) {
            console.error('Failed to add epic:', err);
            // Optionally remove optimistic epic on failure
        }
    }, [data.Initiative.ReleasePlan, planId]);

    const deleteReleasePlan = useCallback(async (planIndex) => {
        const plan = data.Initiative.ReleasePlan[planIndex];
        if (!plan) return;

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.filter((_, idx) => idx !== planIndex)
            }
        }));

        try {
            if (dataService.isConfigured()) {
                await dataService.deleteReleasePlan(planId, plan.id);
            }
        } catch (err) {
            console.error('Failed to delete release plan:', err);
            loadReleaseData();
        }
    }, [planId, data.Initiative.ReleasePlan]);

    const deleteEpic = useCallback(async (planIndex, epicIndex) => {
        const plan = data.Initiative.ReleasePlan[planIndex];
        const epic = plan?.Epics[epicIndex];
        if (!epic) return;

        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((p, pIdx) =>
                    pIdx === planIndex ? {
                        ...p,
                        Epics: p.Epics.filter((_, eIdx) => eIdx !== epicIndex)
                    } : p
                )
            }
        }));

        try {
            if (dataService.isConfigured()) {
                await dataService.deleteEpic(planId, epic.id);
            }
        } catch (err) {
            console.error('Failed to delete epic:', err);
            loadReleaseData();
        }
    }, [planId, data.Initiative.ReleasePlan]);

    const updatePlanningStep = (id, updates) => {
        setData(prev => ({
            ...prev,
            planningSteps: prev.planningSteps.map(step =>
                step.id === id ? { ...step, ...updates } : step
            )
        }));
    };

    const addDeliverable = async (deliverable) => {
        try {
            const tempId = `temp-${Date.now()}`;
            const newDeliverable = { ...deliverable, id: tempId };

            setData(prev => ({
                ...prev,
                Initiative: {
                    ...prev.Initiative,
                    deliverables: [...prev.Initiative.deliverables, newDeliverable]
                }
            }));

            if (dataService.isConfigured()) {
                const dbDeliverable = await dataService.createDeliverable(planId, deliverable);
                setData(prev => ({
                    ...prev,
                    Initiative: {
                        ...prev.Initiative,
                        deliverables: prev.Initiative.deliverables.map(d =>
                            d.id === tempId ? { ...d, id: dbDeliverable.id } : d
                        )
                    }
                }));
            }
        } catch (err) {
            console.error('Failed to add deliverable:', err);
        }
    };

    const updateDeliverable = async (id, updates) => {
        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                deliverables: prev.Initiative.deliverables.map(d =>
                    d.id === id ? { ...d, ...updates } : d
                )
            }
        }));

        if (syncTimeoutRef.current[`deliverable_${id}`]) {
            clearTimeout(syncTimeoutRef.current[`deliverable_${id}`]);
        }

        syncTimeoutRef.current[`deliverable_${id}`] = setTimeout(async () => {
            try {
                if (!dataService.isConfigured()) return;
                await dataService.updateDeliverable(id, updates);
            } catch (err) {
                console.error('Failed to sync deliverable:', err);
            }
        }, 1000);
    };

    const deleteDeliverable = async (id) => {
        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                deliverables: prev.Initiative.deliverables.filter(d => d.id !== id)
            }
        }));

        try {
            if (dataService.isConfigured()) {
                await dataService.deleteDeliverable(id);
            }
        } catch (err) {
            console.error('Failed to delete deliverable:', err);
        }
    };

    const value = {
        data,
        isLoading,
        isSyncing,
        error,
        updateInitiativeMeta,
        updateInitialPlanning,
        updateReleasePlan,
        addReleasePlan,
        deleteReleasePlan,
        addEpic,
        updateEpic,
        deleteEpic,
        updatePlanningStep,
        addDeliverable,
        updateDeliverable,
        deleteDeliverable,
        refresh: loadReleaseData
    };

    return (
        <ReleaseContext.Provider value={value}>
            {children}
        </ReleaseContext.Provider>
    );
}

export function useReleaseData() {
    const context = React.useContext(ReleaseContext);
    if (!context) {
        throw new Error('useReleaseData must be used within a ReleaseProvider');
    }
    return context;
}
