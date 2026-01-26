-- Add pre-planning start and end date columns to release_plans table
ALTER TABLE release_plans
ADD COLUMN IF NOT EXISTS pre_planning_start_date DATE,
ADD COLUMN IF NOT EXISTS pre_planning_end_date DATE;

-- Comment on new columns
COMMENT ON COLUMN release_plans.pre_planning_start_date IS 'Start date for the pre-planning phase of a release';
COMMENT ON COLUMN release_plans.pre_planning_end_date IS 'End date for the pre-planning phase of a release';
