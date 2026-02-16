// Centralized query key factory for React Query
// Using factory pattern for type-safe, consistent query keys

export const queryKeys = {
  // Initiatives
  initiatives: {
    all: ['initiatives'] as const,
    list: () => [...queryKeys.initiatives.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.initiatives.all, 'detail', id] as const,
    timeline: () => [...queryKeys.initiatives.all, 'timeline'] as const,
  },

  // Initial Planning
  initialPlanning: {
    all: ['initialPlanning'] as const,
    byInitiative: (initiativeId: string) =>
      [...queryKeys.initialPlanning.all, initiativeId] as const,
  },

  // Release Plans
  releasePlans: {
    all: ['releasePlans'] as const,
    byInitiative: (initiativeId: string) =>
      [...queryKeys.releasePlans.all, initiativeId] as const,
    detail: (initiativeId: string, planId: string) =>
      [...queryKeys.releasePlans.all, initiativeId, planId] as const,
  },

  // Epics
  epics: {
    all: ['epics'] as const,
    byRelease: (releasePlanId: string) =>
      [...queryKeys.epics.all, releasePlanId] as const,
    byInitiative: (initiativeId: string) =>
      [...queryKeys.epics.all, 'initiative', initiativeId] as const,
  },

  // Deliverables
  deliverables: {
    all: ['deliverables'] as const,
    byInitiative: (initiativeId: string) =>
      [...queryKeys.deliverables.all, initiativeId] as const,
  },

  // Task Deliverables
  taskDeliverables: {
    all: ['taskDeliverables'] as const,
    byTask: (taskId: string) =>
      [...queryKeys.taskDeliverables.all, taskId] as const,
  },

  // Task Updates
  taskUpdates: {
    all: ['taskUpdates'] as const,
    byTask: (taskId: string) =>
      [...queryKeys.taskUpdates.all, taskId] as const,
  },
} as const;
