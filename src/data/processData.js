export const entryCriteria = [
    { id: 'ec-1', team: 'Product', artifact: 'Product Requirements Document (PRD)', description: 'High-level definition of problem, solution, and target audience', completed: false },
    { id: 'ec-2', team: 'Product', artifact: 'Key Performance Indicators (KPIs)', description: 'Metrics for measuring success', completed: false },
    { id: 'ec-3', team: 'UX', artifact: 'Concept (Approved)', description: 'Overarching user experience vision', completed: false },
    { id: 'ec-4', team: 'UX', artifact: 'Main Flows', description: 'Initial high-level user journeys', completed: false },
    { id: 'ec-5', team: 'UX', artifact: 'Copy', description: 'Preliminary text/microcopy', completed: false },
    { id: 'ec-6', team: 'R&D', artifact: 'High-Level Design (if applicable)', description: 'Initial technical architecture', completed: false },
    { id: 'ec-7', team: 'All Teams', artifact: 'Release Content (Epics)', description: 'Scope split into max 4 major epics', completed: false }
];

export const planningSteps = [
    {
        id: 'step-1',
        name: 'Kickoff Meeting: Epic Review',
        team: 'All Teams',
        durationDays: 0.2, // 1 hour
        description: 'Highlight possible issues, technical risks, or major dependencies.',
        checklist: [],
        status: 'not-started',
        color: 'bg-teal-500'
    },
    {
        id: 'step-2',
        name: 'Immediate Use-Case Feedback',
        team: 'R&D',
        durationDays: 0.5, // Half a day
        description: 'Initial technical assessment and potential challenges.',
        checklist: [],
        status: 'not-started',
        color: 'bg-blue-600'
    },
    {
        id: 'step-3',
        name: 'Mature Flows',
        team: 'PM, UX',
        durationDays: 3, // 2-3 days
        description: 'Detailed flow refinement based on R&D feedback.',
        checklist: [],
        status: 'not-started',
        color: 'bg-rose-500'
    },
    {
        id: 'step-4',
        name: 'Meeting: Flow Review & Gap Identification',
        team: 'All Teams',
        durationDays: 0.2, // 2 hours
        description: 'Formal review to identify functional/technical gaps.',
        checklist: [],
        status: 'not-started',
        color: 'bg-teal-500'
    },
    {
        id: 'step-5',
        name: 'Finalize Design & Acceptance Criteria',
        team: 'PM, UX',
        durationDays: 3, // Up to 3 days
        description: 'Create Final Figma and define ACs.',
        checklist: [],
        status: 'not-started',
        color: 'bg-rose-500'
    },
    {
        id: 'step-6',
        name: 'Final Figma Review',
        team: 'R&D',
        durationDays: 1, // 1 calendar day per epic - minimal 1
        description: 'In-depth technical review of designs and ACs.',
        checklist: [],
        status: 'not-started',
        color: 'bg-blue-600'
    },
    {
        id: 'step-7',
        name: 'Meeting: Final Issue & Gap Closure',
        team: 'All Teams',
        durationDays: 1, // Up to 1 day
        description: 'Close all open issues and blockers.',
        checklist: [],
        status: 'not-started',
        color: 'bg-teal-500'
    },
    {
        id: 'step-8',
        name: 'Story Breakdown',
        team: 'R&D',
        durationDays: 0.5, // 1 hour per epic - minimal 0.5
        description: 'Decompose epics into user stories.',
        checklist: [],
        status: 'not-started',
        color: 'bg-blue-600'
    }
];

export const exitCriteria = [
    { id: 'exc-1', team: 'R&D', artifact: 'Stories for All Epics', description: 'Epics decomposed, estimated, and prioritized', completed: false },
    { id: 'exc-2', team: 'UX', artifact: 'Final Figma', description: 'Completed and approved high-fidelity designs', completed: false },
    { id: 'exc-3', team: 'Product', artifact: 'Final Acceptance Criteria', description: 'Definitive ACs for all stories', completed: false },
    { id: 'exc-4', team: 'All Teams', artifact: 'Draft Timeline for QA Events', description: 'Initial schedule for QA milestones', completed: false }
];

export const executionPhases = [
    {
        id: 'exec-1',
        name: 'Development Phase',
        team: 'R&D',
        durationDays: 25, // 5 weeks (5 * 5 working days)
        description: 'Implementation of approved epics.',
        status: 'not-started',
        color: 'bg-emerald-600'
    },
    {
        id: 'exec-2',
        name: 'Testing / QA',
        team: 'QA, R&D',
        durationDays: 5, // 1 week
        description: 'Quality Assurance, bug fixing, final acceptance.',
        status: 'not-started',
        color: 'bg-orange-600'
    }
];
