export type TaskType = 'Dev' | 'POC' | 'Research';
export type TaskBacklog = 'R&D' | 'Product' | 'UX';
export type TaskPhase = 'Planning' | 'Development' | 'Released';

export interface Task {
  id: string;
  name: string;
  description?: string;
  pm?: string;
  ux?: string;
  group?: string;
  developers?: string[];
  type?: TaskType;
  target_date?: string;
  backlog?: TaskBacklog;
  jira_link?: string;
  phase: TaskPhase;
  display_order: number;
  detailed_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskDeliverable {
  id: string;
  task_id: string;
  name: string;
  date?: string;
  status: 'pending' | 'done';
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  pm?: string;
  ux?: string;
  group?: string;
  developers?: string[];
  type?: TaskType;
  target_date?: string;
  backlog?: TaskBacklog;
  jira_link?: string;
  phase?: TaskPhase;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  pm?: string;
  ux?: string;
  group?: string;
  developers?: string[];
  type?: TaskType;
  target_date?: string;
  backlog?: TaskBacklog;
  jira_link?: string;
  phase?: TaskPhase;
  display_order?: number;
  detailed_status?: string;
}

export const TASK_TYPE_OPTIONS: TaskType[] = ['Dev', 'POC', 'Research'];
export const TASK_BACKLOG_OPTIONS: TaskBacklog[] = ['R&D', 'Product', 'UX'];
export const TASK_PHASE_OPTIONS: TaskPhase[] = ['Planning', 'Development', 'Released'];
