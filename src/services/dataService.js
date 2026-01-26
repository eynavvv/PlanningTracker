import { createClient } from '@supabase/supabase-js';
import { addWeeks, format } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Data persistence will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Data Service
 * Handles all interactions with Supabase database
 * Mimics the interface of the previous GoogleSheetsService
 */
class DataService {
    /**
     * Get all initiatives (Releases)
     */
    async getAllReleases() {
        try {
            const { data, error } = await supabase
                .from('initiatives')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            return data.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status || '',
                pm: item.pm || '',
                ux: item.ux || '',
                group: item.group || '',
                techLead: item.tech_lead || '',
                developers: item.developers || [],
            }));
        } catch (error) {
            console.error('Error fetching initiatives:', error);
            throw new Error('Failed to fetch initiatives from database');
        }
    }

    /**
     * Get all data needed for the dashboard timeline
     */
    async getDashboardTimelineData() {
        try {
            // Fetch all initiatives
            const { data: initiatives, error: initError } = await supabase
                .from('initiatives')
                .select('*')
                .order('order_index', { ascending: true });

            if (initError) throw initError;

            // Fetch all initiative planning entries
            const { data: initialPlanning, error: ipError } = await supabase
                .from('initial_planning')
                .select('initiative_id, start_date, planned_end_date');

            if (ipError) throw ipError;

            // Fetch all release plans
            const { data: releasePlans, error: rpError } = await supabase
                .from('release_plans')
                .select('id, initiative_id, goal, pre_planning_start_date, pre_planning_end_date, planning_start_date, planning_end_date, dev_start_date, dev_end_date, qa_event_date, status');

            if (rpError) throw rpError;

            // Group and map data by initiative
            return initiatives.map(init => ({
                id: init.id,
                name: init.name,
                status: init.status || '',
                pm: init.pm || '',
                ux: init.ux || '',
                group: init.group || '',
                techLead: init.tech_lead || '',
                developers: init.developers || [],
                detailedStatus: init.detailed_status || '',
                initialPlanning: initialPlanning.find(ip => ip.initiative_id === init.id),
                releasePlans: releasePlans.filter(rp => rp.initiative_id === init.id)
            }));
        } catch (error) {
            console.error('Error fetching timeline data:', error);
            throw error;
        }
    }

    /**
     * Get data for a specific Initiative
     */
    async getRelease(initiativeId) {
        try {
            // Get initiative basic info
            const { data: initiative, error: initError } = await supabase
                .from('initiatives')
                .select('*')
                .eq('id', initiativeId)
                .single();

            if (initError) throw initError;

            // Get initiative planning data
            const { data: ipData, error: ipError } = await supabase
                .from('initial_planning')
                .select('*')
                .eq('initiative_id', initiativeId)
                .single();

            // Note: ipData might be null if not yet created, handle gracefully
            const initialPlanning = {
                StartDate: ipData?.start_date || '',
                PlannedEndDate: ipData?.planned_end_date || '',
                Status: ipData?.status || '',
                PRD: ipData?.prd_link || '',
                Figma: ipData?.figma_link || '',
                ReleasePlanSummary: ipData?.release_plan_summary || ''
            };

            // Get release plans
            const { data: plans, error: plansError } = await supabase
                .from('release_plans')
                .select('*')
                .eq('initiative_id', initiativeId)
                .order('order_index', { ascending: true });

            if (plansError) throw plansError;

            // Get all epics for this initiative
            const { data: epics, error: epicsError } = await supabase
                .from('epics')
                .select('*')
                .eq('initiative_id', initiativeId);

            if (epicsError) throw epicsError;

            // Map epics to their release plans
            const releasePlans = plans.map(plan => ({
                id: plan.id,
                goal: plan.goal || '',
                prePlanningStartDate: plan.pre_planning_start_date || '',
                prePlanningEndDate: plan.pre_planning_end_date || '',
                planningStartDate: plan.planning_start_date || '',
                planningEndDate: plan.planning_end_date || '',
                devStartDate: plan.dev_start_date || '',
                devEndDate: plan.dev_end_date || '',
                status: plan.status || '',
                reqDoc: plan.req_doc || '',
                devs: plan.devs || '',
                devPlan: plan.kpi || '',
                qaEventDate: plan.qa_event_date || '',
                externalReleaseDate: plan.external_release_date || '',
                Epics: epics.filter(e => e.release_plan_id === plan.id).map(e => ({
                    id: e.id,
                    releaseId: e.release_plan_id,
                    Name: e.name,
                    Status: e.status || 'Pending',
                    Link: e.jira_link || '',
                    loe: e.loe || '',
                    ac: e.ac || '',
                    figma: e.figma_link || '',
                    description: e.description || ''
                }))
            }));

            // Handle orphaned epics (no release_plan_id)
            const orphanedEpics = epics
                .filter(e => !e.release_plan_id)
                .map(e => ({
                    id: e.id,
                    Name: e.name,
                    Status: e.status || 'Pending',
                    Link: e.jira_link || '',
                    loe: e.loe || '',
                    ac: e.ac || '',
                    figma: e.figma_link || '',
                    description: e.description || ''
                }));

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
                    id: initiative.id,
                    name: initiative.name,
                    status: initiative.status || '',
                    pm: initiative.pm || '',
                    ux: initiative.ux || '',
                    group: initiative.group || '',
                    techLead: initiative.tech_lead || '',
                    developers: initiative.developers || [],
                    detailedStatus: initiative.detailed_status || '',
                    InitialPlanning: initialPlanning,
                    ReleasePlan: releasePlans
                }
            };

        } catch (error) {
            console.error(`Error fetching initiative ${initiativeId}:`, error);
            throw new Error(`Failed to fetch data for initiative`);
        }
    }

    /**
     * Get deliverables for an initiative
     */
    async getDeliverables(initiativeId) {
        try {
            console.log('Fetching deliverables for initiative:', initiativeId);
            const { data, error } = await supabase
                .from('deliverables')
                .select('*')
                .eq('initiative_id', initiativeId)
                .order('date', { ascending: true });

            if (error) {
                console.error('Supabase error fetching deliverables:', error);
                if (error.code === 'PGRST116' || error.message.includes('not found')) return [];
                throw error;
            }
            console.log('Fetched deliverables:', data);
            return data.map(d => ({
                id: d.id,
                name: d.name,
                date: d.date,
                status: d.status || 'pending'
            }));
        } catch (error) {
            console.error('Error fetching deliverables:', error);
            return [];
        }
    }

    /**
     * Create a new initiative
     */
    async createInitiative(name) {
        try {
            // First create the initiative
            const { data, error } = await supabase
                .from('initiatives')
                .insert([{ name, status: 'Initiative Planning' }])
                .select()
                .single();

            if (error) throw error;

            const today = new Date();
            const startDate = format(today, 'yyyy-MM-dd');
            const endDate = format(addWeeks(today, 6), 'yyyy-MM-dd');

            // Then create an empty initiative planning entry for it
            await supabase
                .from('initial_planning')
                .insert([{
                    initiative_id: data.id,
                    start_date: startDate,
                    planned_end_date: endDate
                }]);

            return { success: true, id: data.id };
        } catch (error) {
            console.error('Error creating initiative:', error);
            throw error;
        }
    }

    /**
     * Update initiative basic info
     */
    async updateInitiative(initiativeId, updates) {
        try {
            // Map common field names if necessary (e.g., techLead -> tech_lead)
            const dbUpdates = {};
            if ('techLead' in updates) dbUpdates.tech_lead = updates.techLead;
            if ('pm' in updates) dbUpdates.pm = updates.pm;
            if ('ux' in updates) dbUpdates.ux = updates.ux;
            if ('status' in updates) dbUpdates.status = updates.status;
            if ('group' in updates) dbUpdates.group = updates.group;
            if ('developers' in updates) dbUpdates.developers = updates.developers;
            if ('detailedStatus' in updates) dbUpdates.detailed_status = updates.detailedStatus;

            const { error } = await supabase
                .from('initiatives')
                .update(dbUpdates)
                .eq('id', initiativeId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating initiative:', error);
            throw error;
        }
    }

    /**
     * Create a new Release Plan
     */
    async createReleasePlan(initiativeId, name) {
        try {
            const today = new Date();
            const planningStart = format(today, 'yyyy-MM-dd');
            const planningEnd = format(addWeeks(today, 2), 'yyyy-MM-dd');
            // Dev starts when planning ends (conceptually), or same day? Usually sequential.
            // "2 weeks for planning, 6 weeks for dev". 
            // Let's assume Dev starts after Planning.
            const devStart = planningEnd;
            const devEnd = format(addWeeks(today, 8), 'yyyy-MM-dd'); // 2 + 6 = 8 weeks total

            const { data, error } = await supabase
                .from('release_plans')
                .insert([{
                    initiative_id: initiativeId,
                    goal: name,
                    status: 'Planning',
                    planning_start_date: planningStart,
                    planning_end_date: planningEnd,
                    dev_start_date: devStart,
                    dev_end_date: devEnd,
                    order_index: 0 // You might want to calculate this
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating release plan:', error);
            throw error;
        }
    }

    /**
     * Update Initiative Planning data
     */
    async updateInitialPlanning(initiativeId, updates) {
        try {
            const dbUpdates = {};
            if ('StartDate' in updates) dbUpdates.start_date = updates.StartDate;
            if ('PlannedEndDate' in updates) dbUpdates.planned_end_date = updates.PlannedEndDate;
            if ('Status' in updates) dbUpdates.status = updates.Status;
            if ('PRD' in updates) dbUpdates.prd_link = updates.PRD;
            if ('Figma' in updates) dbUpdates.figma_link = updates.Figma;
            if ('ReleasePlanSummary' in updates) dbUpdates.release_plan_summary = updates.ReleasePlanSummary;

            const { error } = await supabase
                .from('initial_planning')
                .update(dbUpdates)
                .eq('initiative_id', initiativeId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating initiative planning:', error);
            throw error;
        }
    }

    /**
     * Update or create a Release Plan
     */
    async updateReleasePlan(initiativeId, planId, updates) {
        try {
            const dbUpdates = { ...updates };
            if (dbUpdates.prePlanningStartDate !== undefined) {
                dbUpdates.pre_planning_start_date = dbUpdates.prePlanningStartDate;
                delete dbUpdates.prePlanningStartDate;
            }
            if (dbUpdates.prePlanningEndDate !== undefined) {
                dbUpdates.pre_planning_end_date = dbUpdates.prePlanningEndDate;
                delete dbUpdates.prePlanningEndDate;
            }
            if (dbUpdates.planningStartDate) {
                dbUpdates.planning_start_date = dbUpdates.planningStartDate;
                delete dbUpdates.planningStartDate;
            }
            if (dbUpdates.planningEndDate) {
                dbUpdates.planning_end_date = dbUpdates.planningEndDate;
                delete dbUpdates.planningEndDate;
            }
            if (dbUpdates.devStartDate) {
                dbUpdates.dev_start_date = dbUpdates.devStartDate;
                delete dbUpdates.devStartDate;
            }
            if (dbUpdates.devEndDate) {
                dbUpdates.dev_end_date = dbUpdates.devEndDate;
                delete dbUpdates.devEndDate;
            }
            if (dbUpdates.reqDoc) {
                dbUpdates.req_doc = dbUpdates.reqDoc;
                delete dbUpdates.reqDoc;
            }
            if (dbUpdates.qaEventDate !== undefined) {
                dbUpdates.qa_event_date = dbUpdates.qaEventDate;
                delete dbUpdates.qaEventDate;
            }
            if (dbUpdates.externalReleaseDate) {
                dbUpdates.external_release_date = dbUpdates.externalReleaseDate;
                delete dbUpdates.externalReleaseDate;
            }

            if (dbUpdates.devPlan !== undefined) {
                dbUpdates.kpi = dbUpdates.devPlan;
                delete dbUpdates.devPlan;
            }

            delete dbUpdates.id;
            delete dbUpdates.Epics;

            const { error } = await supabase
                .from('release_plans')
                .update(dbUpdates)
                .eq('id', planId)
                .eq('initiative_id', initiativeId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating release plan:', error);
            throw error;
        }
    }

    /**
     * Create a new Epic
     */
    async createEpic(initiativeId, releasePlanId, name) {
        try {
            const { data, error } = await supabase
                .from('epics')
                .insert([{
                    initiative_id: initiativeId,
                    release_plan_id: releasePlanId,
                    name: name,
                    status: 'Pending'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating epic:', error);
            throw error;
        }
    }

    /**
     * Update or create an Epic
     */
    async updateEpic(initiativeId, epicId, updates) {
        try {
            const dbUpdates = {};
            if ('Name' in updates) dbUpdates.name = updates.Name;
            if ('Status' in updates) dbUpdates.status = updates.Status;
            if ('Link' in updates) dbUpdates.jira_link = updates.Link;
            if ('loe' in updates) dbUpdates.loe = updates.loe;
            if ('ac' in updates) dbUpdates.ac = updates.ac;
            if ('figma' in updates) dbUpdates.figma_link = updates.figma;
            if ('description' in updates) dbUpdates.description = updates.description;
            if ('releaseId' in updates) dbUpdates.release_plan_id = updates.releaseId;

            const { error } = await supabase
                .from('epics')
                .update(dbUpdates)
                .eq('id', epicId)
                .eq('initiative_id', initiativeId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating epic:', error);
            throw error;
        }
    }

    async updateInitiativeOrder(orderedIds) {
        try {
            // Update each initiative with its new order_index
            const updates = orderedIds.map((id, index) => ({
                id,
                order_index: index
            }));

            await Promise.all(
                updates.map(update =>
                    supabase
                        .from('initiatives')
                        .update({ order_index: update.order_index })
                        .eq('id', update.id)
                )
            );
            return { success: true };
        } catch (error) {
            console.error('Error updating initiative order:', error);
            throw error;
        }
    }

    /**
     * Delete an initiative
     */
    async deleteInitiative(id) {
        try {
            const { error } = await supabase
                .from('initiatives')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting initiative:', error);
            throw error;
        }
    }

    /**
     * Delete a release plan
     */
    async deleteReleasePlan(initiativeId, planId) {
        try {
            const { error } = await supabase
                .from('release_plans')
                .delete()
                .eq('id', planId)
                .eq('initiative_id', initiativeId);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting release plan:', error);
            throw error;
        }
    }

    /**
     * Delete an epic
     */
    async deleteEpic(initiativeId, epicId) {
        try {
            const { error } = await supabase
                .from('epics')
                .delete()
                .eq('id', epicId)
                .eq('initiative_id', initiativeId);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting epic:', error);
            throw error;
        }
    }

    /**
     * Deliverables CRUD
     */
    async createDeliverable(initiativeId, deliverable) {
        try {
            console.log('Creating deliverable for initiative:', initiativeId, deliverable);
            const { data, error } = await supabase
                .from('deliverables')
                .insert([{
                    initiative_id: initiativeId,
                    name: deliverable.name,
                    date: deliverable.date || null,
                    status: deliverable.status || 'pending'
                }])
                .select()
                .single();
            if (error) {
                console.error('Supabase error creating deliverable:', error);
                throw error;
            }
            console.log('Deliverable created successfully:', data);
            return data;
        } catch (error) {
            console.error('Error creating deliverable:', error);
            throw error;
        }
    }

    async updateDeliverable(id, updates) {
        try {
            console.log('Updating deliverable:', id, updates);
            const { error } = await supabase
                .from('deliverables')
                .update(updates)
                .eq('id', id);
            if (error) {
                console.error('Supabase error updating deliverable:', error);
                throw error;
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating deliverable:', error);
            throw error;
        }
    }

    async deleteDeliverable(id) {
        try {
            console.log('Deleting deliverable:', id);
            const { error } = await supabase
                .from('deliverables')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Supabase error deleting deliverable:', error);
                throw error;
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting deliverable:', error);
            throw error;
        }
    }

    // ==========================================
    // Tasks (Roadmap Fillers) CRUD
    // ==========================================

    /**
     * Get all tasks ordered by display_order
     */
    async getTasks() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    /**
     * Create a new task
     */
    async createTask(task) {
        try {
            // Get the highest display_order to put new task at the end
            const { data: existingTasks } = await supabase
                .from('tasks')
                .select('display_order')
                .order('display_order', { ascending: false })
                .limit(1);

            const maxOrder = existingTasks?.[0]?.display_order ?? -1;

            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    name: task.name,
                    description: task.description || null,
                    pm: task.pm || null,
                    ux: task.ux || null,
                    group: task.group || null,
                    developers: task.developers || null,
                    type: task.type || null,
                    target_date: task.target_date || null,
                    backlog: task.backlog || null,
                    jira_link: task.jira_link || null,
                    phase: task.phase || 'Planning',
                    display_order: maxOrder + 1
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    /**
     * Update a task
     */
    async updateTask(taskId, updates) {
        try {
            const dbUpdates = { ...updates };

            const { error } = await supabase
                .from('tasks')
                .update(dbUpdates)
                .eq('id', taskId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    /**
     * Update task order
     */
    async updateTaskOrder(orderedIds) {
        try {
            const updates = orderedIds.map((id, index) => ({
                id,
                display_order: index
            }));

            await Promise.all(
                updates.map(update =>
                    supabase
                        .from('tasks')
                        .update({ display_order: update.display_order })
                        .eq('id', update.id)
                )
            );
            return { success: true };
        } catch (error) {
            console.error('Error updating task order:', error);
            throw error;
        }
    }

    isConfigured() {
        return !!(supabaseUrl && supabaseAnonKey);
    }
}

export const dataService = new DataService();
