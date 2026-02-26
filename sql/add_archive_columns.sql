-- Add is_archived column to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add is_archived column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
