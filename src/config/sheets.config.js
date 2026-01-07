export const SHEETS_CONFIG = {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    spreadsheetId: import.meta.env.VITE_GOOGLE_SPREADSHEET_ID,
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL,

    // Tab names
    RELEASES_TAB: 'initiatives', // Renamed from "releases" to match user description if needed, or keeping generic

    // 1. INITIATIVES SHEET (List of all initiatives)
    INITIATIVE_COLUMNS: {
        NAME: 0,          // A: Initiative Name
        STATUS: 1,        // B: Status (Initial Planning, Release Planning, Development, Released)
        PM: 2,            // C: PM (Naama, Asaf, Sapir)
        UX: 3,            // D: UX (Tal, Maya, Naor)
        GROUP: 4,         // E: Group (Zebra, Pegasus)
        TECH_LEAD: 5,     // F: Tech lead (String)
        DEVELOPERS: 6     // G: Developers (List of string)
    },

    // 2. INITIATIVE TEMPLATE STRUCTURE (Per Initiative Sheet)

    // Section A: Release Planning (Rows 2-13)
    RELEASE_PLAN_RANGE: 'A2:I13', // ID, Goal, Start date, End date, Status, LOE, Req Doc, Devs, KPI
    RELEASE_PLAN_COLUMNS: {
        ID: 0,          // A
        NAME: 1,        // B
        START_DATE: 2,  // C
        END_DATE: 3,    // D
        STATUS: 4,      // E
        LOE: 5,         // F
        REQ_DOC: 6,     // G
        DEVS: 7,        // H
        KPI: 8          // I
    },

    // Section B: Initial Planning (Rows 15-28)
    INITIAL_PLANNING_RANGE: 'A15:F28', // Start date, Planned end date, Status, PRD, Figma, Release plan doc
    INITIAL_PLANNING_COLUMNS: {
        START_DATE: 0,      // A
        PLANNED_END: 1,     // B
        STATUS: 2,          // C
        PRD: 3,             // D
        FIGMA: 4,           // E
        RELEASE_DOC: 5      // F
    },

    // Section C: Epics (Rows 30-60)
    EPICS_RANGE: 'A30:J200', // ReleaseID, Name, AC status, C, D, Jira link, LOE, AC, Figma (Design), Desc
    EPICS_COLUMNS: {
        RELEASE_ID: 0,      // A
        NAME: 1,            // B
        STATUS: 2,          // C (AC Status)
        LINK: 5,            // F (Jira Link)
        LOE: 6,             // G
        AC: 7,              // H (Acceptance Criteria)
        FIGMA: 8,           // I (Figma Link)
        DESCRIPTION: 9      // J (Description)
    },

    DATA_START_ROW: 2
};
