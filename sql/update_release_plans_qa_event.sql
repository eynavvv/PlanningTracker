-- Migration: Update release_plans table
-- Remove loe and internal_release_date columns, add qa_event_date column

-- Add the new qa_event_date column
ALTER TABLE release_plans
ADD COLUMN IF NOT EXISTS qa_event_date DATE;

-- Remove the loe column (optional - uncomment if you want to drop it)
-- Note: Only run this if you're sure you don't need the existing LOE data
-- ALTER TABLE release_plans DROP COLUMN IF EXISTS loe;

-- Remove the internal_release_date column (optional - uncomment if you want to drop it)
-- Note: Only run this if you're sure you don't need the existing internal release date data
-- ALTER TABLE release_plans DROP COLUMN IF EXISTS internal_release_date;
