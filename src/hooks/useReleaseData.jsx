import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sheetsService } from '../services/googleSheets.js';

const initialData = {
    Initiative: {
        Name: "",
        Status: "",
        PM: "",
        UX: "",
        Group: "",
        TechLead: "",
        Developers: [],
        InitialPlanning: {
            StartDate: "",
            PlannedEndDate: "",
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

            if (!sheetsService.isConfigured()) {
                setData(initialData);
                setIsLoading(false);
                return;
            }

            try {
                const sheetData = await sheetsService.getRelease(planId);
                const allReleases = await sheetsService.getAllReleases();
                const initiativeMeta = allReleases.find(r => r.name === planId);
                releaseMetadataRef.current = initiativeMeta;

                const loadedData = {
                    Initiative: {
                        Name: planId,
                        Status: initiativeMeta?.status || "",
                        PM: initiativeMeta?.pm || "",
                        UX: initiativeMeta?.ux || "",
                        Group: initiativeMeta?.group || "",
                        TechLead: initiativeMeta?.techLead || "",
                        Developers: initiativeMeta?.developers || [],
                        InitialPlanning: sheetData.Initiative.InitialPlanning,
                        ReleasePlan: sheetData.Initiative.ReleasePlan
                    },
                    planningSteps: initialData.planningSteps
                };

                setData(loadedData);
            } catch (err) {
                console.error('Error loading from Google Sheets, using initial data:', err);
                setData(initialData);
            }
        } catch (err) {
            console.error('Failed to load release data:', err);
            setError(err.message || 'Failed to load release data');
            setData(initialData);
        } finally {
            setIsLoading(false);
        }
    };

    const updateInitiativeMeta = (field, value) => {
        setData(prev => ({
            ...prev,
            Initiative: { ...prev.Initiative, [field]: value }
        }));
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
                if (!sheetsService.isConfigured()) return;
                await sheetsService.updateInitialPlanning(planId, { [field]: value });
            } catch (err) {
                console.error('Failed to sync initial planning:', err);
            }
        }, 1000);
    }, [planId]);

    const updateReleasePlan = useCallback((planIndex, field, value) => {
        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((plan, idx) =>
                    idx === planIndex ? { ...plan, [field]: value } : plan
                )
            }
        }));

        const key = `releasePlan_${planIndex}`;
        if (syncTimeoutRef.current[key]) {
            clearTimeout(syncTimeoutRef.current[key]);
        }

        syncTimeoutRef.current[key] = setTimeout(async () => {
            try {
                if (!sheetsService.isConfigured()) return;
                await sheetsService.updateReleasePlan(planId, planIndex, { [field]: value });
            } catch (err) {
                console.error('Failed to sync release plan:', err);
            }
        }, 1000);
    }, [planId]);

    const updateEpic = useCallback((planIndex, epicIndex, field, value) => {
        setData(prev => ({
            ...prev,
            Initiative: {
                ...prev.Initiative,
                ReleasePlan: prev.Initiative.ReleasePlan.map((plan, pIdx) =>
                    pIdx === planIndex ? {
                        ...plan,
                        Epics: plan.Epics.map((epic, eIdx) =>
                            eIdx === epicIndex ? { ...epic, [field]: value } : epic
                        )
                    } : plan
                )
            }
        }));

        const key = `epic_${planIndex}_${epicIndex}`;
        if (syncTimeoutRef.current[key]) {
            clearTimeout(syncTimeoutRef.current[key]);
        }

        syncTimeoutRef.current[key] = setTimeout(async () => {
            try {
                if (!sheetsService.isConfigured()) return;
                let globalEpicIndex = 0;
                for (let i = 0; i < planIndex; i++) {
                    globalEpicIndex += data.Initiative.ReleasePlan[i].Epics.length;
                }
                globalEpicIndex += epicIndex;

                await sheetsService.updateEpic(planId, globalEpicIndex, { [field]: value });
            } catch (err) {
                console.error('Failed to sync epic:', err);
            }
        }, 1000);
    }, [planId, data]);

    const addReleasePlan = useCallback(async (name) => {
        const newIndex = data.Initiative.ReleasePlan.length;
        const newId = (newIndex + 1).toString();

        const newPlan = {
            id: newId,
            goal: name,
            status: 'Planning',
            startDate: '',
            endDate: '',
            loe: '',
            reqDoc: '',
            devs: '',
            kpi: '',
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
            if (sheetsService.isConfigured()) {
                await sheetsService.updateReleasePlan(planId, newIndex, {
                    id: newId,
                    goal: name,
                    status: 'Planning'
                });
            }
        } catch (err) {
            console.error('Failed to add release plan:', err);
            // Revert or reload if needed, for now just log
        }
    }, [data, planId]);

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
            if (sheetsService.isConfigured()) {
                await sheetsService.updateEpic(planId, currentTotalEpics, {
                    ReleaseId: targetReleaseId,
                    Name: name,
                    Status: 'Pending'
                });
            }
        } catch (err) {
            console.error('Failed to add epic:', err);
        }
    }, [data, planId]);

    const updatePlanningStep = (id, updates) => {
        setData(prev => ({
            ...prev,
            planningSteps: prev.planningSteps.map(step =>
                step.id === id ? { ...step, ...updates } : step
            )
        }));
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
        addEpic,
        updateEpic,
        updatePlanningStep,
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
