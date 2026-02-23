-- 1. Add detailed_status column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS detailed_status TEXT;

-- 2. Create task_deliverables table
CREATE TABLE IF NOT EXISTS task_deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_deliverables_task_id ON task_deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deliverables_date ON task_deliverables(date);

-- 3. Create task_updates table (activity feed)
CREATE TABLE IF NOT EXISTS task_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_created_at ON task_updates(created_at DESC);
