// Initiative and Release Planning Types

export type InitiativeStatus =
  | 'Initiative Planning'
  | 'Release Planning'
  | 'Development'
  | 'Released'
  | 'On Hold';

export type PlanningStatus =
  | 'PRD'
  | 'Solutioning'
  | 'Release plan planning'
  | 'Done';

export type ReleaseStatus =
  | 'Planning'
  | 'Development'
  | 'Released'
  | 'Pending';

export type EpicStatus =
  | 'Pending'
  | 'Planning'
  | 'Ready for review'
  | 'Ready for dev'
  | 'Dev'
  | 'Done';

export type DeliverableStatus = 'pending' | 'done';

export interface Initiative {
  id: string;
  name: string;
  status: InitiativeStatus;
  pm: string | null;
  ux: string | null;
  group: string | null;
  techLead: string | null;
  developers: string | null;
  detailedStatus: string | null;
  orderIndex: number;
}

export interface InitialPlanning {
  id?: string;
  initiativeId: string;
  startDate: string | null;
  plannedEndDate: string | null;
  status: PlanningStatus;
  prd: string | null;
  figma: string | null;
  releasePlanSummary: string | null;
}

export interface Epic {
  id: string;
  initiativeId: string;
  releasePlanId: string;
  name: string;
  description: string | null;
  status: EpicStatus;
  jiraLink: string | null;
  loe: string | null;
  ac: string | null;
  figma: string | null;
}

export interface ReleasePlan {
  id: string;
  initiativeId: string;
  goal: string;
  status: ReleaseStatus;
  planningStartDate: string | null;
  planningEndDate: string | null;
  devStartDate: string | null;
  devEndDate: string | null;
  loe: string | null;
  devs: string | null;
  kpi: string | null;
  reqDoc: string | null;
  internalReleaseDate: string | null;
  externalReleaseDate: string | null;
  orderIndex: number;
  epics: Epic[];
}

export interface Deliverable {
  id: string;
  initiativeId: string;
  name: string;
  date: string | null;
  status: DeliverableStatus;
}

export interface PlanningStep {
  id: number;
  name: string;
  description: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'done';
}

// Combined data structure returned by useReleaseData
export interface InitiativeData {
  Initiative: Initiative & {
    InitialPlanning: InitialPlanning;
    ReleasePlan: ReleasePlan[];
    deliverables: Deliverable[];
  };
  planningSteps: PlanningStep[];
}

// Dashboard timeline data
export interface TimelineInitiative {
  id: string;
  name: string;
  status: InitiativeStatus;
  pm: string | null;
  ux: string | null;
  group: string | null;
  orderIndex: number;
  initialPlanning: {
    startDate: string | null;
    plannedEndDate: string | null;
    status: PlanningStatus;
  } | null;
  releasePlans: Array<{
    id: string;
    goal: string;
    status: ReleaseStatus;
    planningStartDate: string | null;
    planningEndDate: string | null;
    devStartDate: string | null;
    devEndDate: string | null;
  }>;
}
