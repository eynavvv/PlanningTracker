import { SHEETS_CONFIG } from '../config/sheets.config.js';

/**
 * Google Sheets Service
 * Handles all interactions with Google Sheets API using API key authentication
 */

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

class GoogleSheetsService {
    constructor() {
        this.apiKey = SHEETS_CONFIG.apiKey;
        this.spreadsheetId = SHEETS_CONFIG.spreadsheetId;
        this.appsScriptUrl = SHEETS_CONFIG.appsScriptUrl;
        this.baseUrl = `${SHEETS_API_BASE}/${this.spreadsheetId}`;
    }

    /**
     * Call Apps Script web app for write operations
     */
    async callAppsScript(action, data) {
        if (!this.appsScriptUrl || this.appsScriptUrl === 'your_apps_script_url_here') {
            throw new Error('Apps Script URL not configured. Please set VITE_APPS_SCRIPT_URL in .env file.');
        }

        try {
            console.log(`[GoogleSheets] Calling Apps Script: ${action}`, data);

            // Google Apps Script Web Apps ALWAYS return a 302 redirect for POST requests.
            // fetch() follows this by default with a GET request to the redirected URL.
            const response = await fetch(this.appsScriptUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain', // Vital to avoid CORS preflight (OPTIONS)
                },
                body: JSON.stringify({
                    action,
                    ...data
                })
            });

            if (!response.ok) {
                // If it's a 302 that wasn't followed (rarely happens with fetch but good to catch)
                if (response.status === 302) {
                    throw new Error('Apps Script returned a redirect that was not followed. This usually indicates a CORS issue or multiple Google account login conflict.');
                }
                const text = await response.text();
                console.error(`Apps Script response error (${response.status}):`, text);
                throw new Error(`Apps Script server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                console.error('[GoogleSheets] Apps Script returned error result:', result.error);
                throw new Error(result.error);
            }

            console.log(`[GoogleSheets] Apps Script success: ${action}`, result);
            return result;
        } catch (error) {
            console.error('[GoogleSheets] CallAppsScript failed:', error);

            // Helpful message for SyntaxError (usually means an HTML error page was returned)
            if (error instanceof SyntaxError) {
                throw new Error('Invalid response from Apps Script. The script might have encountered a fatal error before returning JSON. Please check the Apps Script logs and Deployment.');
            }

            throw error;
        }
    }

    /**
     * Generic method to make API requests with error handling and retries
     */
    async apiRequest(url, options = {}, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error?.message || `API request failed: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }

    /**
     * Read data from a specific range in the spreadsheet
     */
    async readRange(range) {
        const url = `${this.baseUrl}/values/${encodeURIComponent(range)}?key=${this.apiKey}`;
        const data = await this.apiRequest(url);
        return data.values || [];
    }

    /**
     * Get all initiatives (Releases) from the main list tab
     */
    async getAllReleases() {
        try {
            const range = `${SHEETS_CONFIG.RELEASES_TAB}!A${SHEETS_CONFIG.DATA_START_ROW}:G`;
            const rows = await this.readRange(range);

            return rows
                .map((row, index) => ({
                    rowIndex: index + SHEETS_CONFIG.DATA_START_ROW,
                    id: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.NAME] || 'New Initiative',
                    name: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.NAME] || '',
                    status: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.STATUS] || '',
                    pm: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.PM] || '',
                    ux: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.UX] || '',
                    group: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.GROUP] || '',
                    techLead: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.TECH_LEAD] || '',
                    developers: row[SHEETS_CONFIG.INITIATIVE_COLUMNS.DEVELOPERS] ? row[SHEETS_CONFIG.INITIATIVE_COLUMNS.DEVELOPERS].split(',') : [],
                }))
                .filter(init => init.name.trim() !== '');
        } catch (error) {
            console.error('Error fetching initiatives:', error);
            throw new Error('Failed to fetch initiatives from Google Sheets');
        }
    }

    /**
     * Get data for a specific Initiative (Tab Name = Initiative Name)
     */
    async getRelease(initiativeName) {
        try {
            // Section A: Release Planning (Rows 2-13)
            const releasePlanPromise = this.readRange(`${initiativeName}!${SHEETS_CONFIG.RELEASE_PLAN_RANGE}`);

            // Section B: Initial Planning (Rows 15-28)
            const initialPlanningPromise = this.readRange(`${initiativeName}!${SHEETS_CONFIG.INITIAL_PLANNING_RANGE}`);

            // Section C: Epics (Rows 30-43)
            const epicsPromise = this.readRange(`${initiativeName}!${SHEETS_CONFIG.EPICS_RANGE}`);

            const [releasePlanRows, initialPlanningRows, epicsRows] = await Promise.all([
                releasePlanPromise,
                initialPlanningPromise,
                epicsPromise
            ]);

            // Parse Initial Planning (Row 16 metadata assumption)
            const ipRow = initialPlanningRows.length > 1 ? initialPlanningRows[1] : (initialPlanningRows[0] || []);
            const initialPlanning = {
                StartDate: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.START_DATE] || '',
                PlannedEndDate: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.PLANNED_END] || '',
                Status: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.STATUS] || '',
                PRD: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.PRD] || '',
                Figma: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.FIGMA] || '',
                ReleasePlanSummary: ipRow[SHEETS_CONFIG.INITIAL_PLANNING_COLUMNS.RELEASE_DOC] || ''
            };

            // Parse Release Plans (Rows 2-13)
            const releasePlans = releasePlanRows.slice(1).map((row, idx) => ({
                id: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.ID] || (idx + 1).toString(),
                goal: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.NAME] || '',
                startDate: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.START_DATE] || '',
                endDate: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.END_DATE] || '',
                status: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.STATUS] || '',
                loe: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.LOE] || '',
                reqDoc: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.REQ_DOC] || '',
                devs: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.DEVS] || '',
                kpi: row[SHEETS_CONFIG.RELEASE_PLAN_COLUMNS.KPI] || '',
                Epics: []
            })).filter(rp => rp.goal !== '');

            // Parse Epics (Rows 30-200)
            const allEpics = epicsRows.slice(1).map((row, idx) => ({
                id: `epic-${idx}`,
                releaseId: row[SHEETS_CONFIG.EPICS_COLUMNS.RELEASE_ID],
                Name: row[SHEETS_CONFIG.EPICS_COLUMNS.NAME] || '',
                Status: row[SHEETS_CONFIG.EPICS_COLUMNS.STATUS] || 'Pending',
                Link: row[SHEETS_CONFIG.EPICS_COLUMNS.LINK] || '',
                loe: row[SHEETS_CONFIG.EPICS_COLUMNS.LOE] || '',
                ac: row[SHEETS_CONFIG.EPICS_COLUMNS.AC] || '',
                figma: row[SHEETS_CONFIG.EPICS_COLUMNS.FIGMA] || '',
                description: row[SHEETS_CONFIG.EPICS_COLUMNS.DESCRIPTION] || ''
            })).filter(e => e.Name !== '');

            // Assign Epics to their respective Release Plans
            releasePlans.forEach(plan => {
                plan.Epics = allEpics.filter(e => e.releaseId == plan.id);
            });

            // Handle orphaned epics (no matching release ID)
            const orphanedEpics = allEpics.filter(e => !e.releaseId || !releasePlans.some(rp => rp.id == e.releaseId));

            if (orphanedEpics.length > 0) {
                releasePlans.push({
                    id: 'backlog',
                    goal: 'Backlog / Unassigned',
                    status: 'Pending',
                    Epics: orphanedEpics
                });
            }

            return {
                Initiative: {
                    InitialPlanning: initialPlanning,
                    ReleasePlan: releasePlans
                }
            };

        } catch (error) {
            console.error(`Error fetching initiative ${initiativeName}:`, error);
            throw new Error(`Failed to fetch data for ${initiativeName}`);
        }
    }

    /**
     * Create a new initiative by copying the template
     * Includes a verification fallback if the request fails (common with Google redirects/triggers)
     */
    async createInitiative(name) {
        try {
            console.log(`[GoogleSheets] Attempting to create initiative: ${name}`);
            await this.callAppsScript('createInitiative', {
                name: name
            });
            return { success: true };
        } catch (error) {
            // If it failed but the error message indicates it already exists, that's a "success" for us
            if (error.message.includes('DUPLICATE_NAME') || error.message.includes('already exists')) {
                console.log('[GoogleSheets] Initiative already exists, proceeding as success.');
                return { success: true, verified: true };
            }

            console.warn('[GoogleSheets] createInitiative call failed, verifying if it was created anyway...', error);

            // Wait for 2.5 seconds to allow Google to finish any pending writes/triggers
            await new Promise(resolve => setTimeout(resolve, 2500));

            try {
                // Check if the initiative now exists in the list
                const releases = await this.getAllReleases();
                const exists = releases.some(r => r.name.toLowerCase() === name.toLowerCase());

                if (exists) {
                    console.log(`[GoogleSheets] Verified: Initiative "${name}" was created successfully despite the reported error.`);
                    return { success: true, verified: true };
                }
            } catch (verifyError) {
                console.error('[GoogleSheets] Verification fallback failed:', verifyError);
            }

            // If verification failed too, throw the original error
            throw error;
        }
    }

    /**
     * Update a specific initiative field in the initiatives sheet
     */
    async updateInitiative(rowIndex, updates) {
        try {
            await this.callAppsScript('updateInitiative', {
                rowIndex,
                updates
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating initiative:', error);
            throw new Error('Failed to update initiative');
        }
    }

    /**
     * Update Initial Planning metadata for an initiative
     */
    async updateInitialPlanning(initiativeName, updates) {
        try {
            await this.callAppsScript('updateInitialPlanning', {
                initiativeName,
                updates
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating initial planning:', error);
            throw new Error('Failed to update initial planning');
        }
    }

    /**
     * Update a specific Release Plan
     */
    async updateReleasePlan(initiativeName, planIndex, updates) {
        try {
            await this.callAppsScript('updateReleasePlan', {
                initiativeName,
                planIndex,
                updates
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating release plan:', error);
            throw new Error('Failed to update release plan');
        }
    }

    /**
     * Update a specific Epic
     */
    async updateEpic(initiativeName, epicIndex, updates) {
        try {
            await this.callAppsScript('updateEpic', {
                initiativeName,
                epicIndex,
                updates
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating epic:', error);
            throw new Error('Failed to update epic');
        }
    }

    isConfigured() {
        return !!(this.apiKey && this.spreadsheetId &&
            this.apiKey !== 'your_api_key_here' &&
            this.spreadsheetId !== 'your_spreadsheet_id_here');
    }
}

export const sheetsService = new GoogleSheetsService();
