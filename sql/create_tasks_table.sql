-- Create tasks table for Roadmap Fillers
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pm VARCHAR(100),
    ux VARCHAR(100),
    "group" VARCHAR(100),
    developers TEXT[], -- Array of developer names
    type VARCHAR(50) CHECK (type IN ('Dev', 'POC', 'Research')),
    target_date DATE,
    backlog VARCHAR(50) CHECK (backlog IN ('R&D', 'Product', 'UX')),
    jira_link VARCHAR(500),
    phase VARCHAR(50) DEFAULT 'Planning' CHECK (phase IN ('Planning', 'Development', 'Released')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_tasks_display_order ON tasks(display_order);

-- Create index for filtering by phase
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);

-- Create index for filtering by type
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);

-- Create index for filtering by backlog
CREATE INDEX IF NOT EXISTS idx_tasks_backlog ON tasks(backlog);

-- Enable Row Level Security (optional, if you're using Supabase RLS)
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your auth requirements)
-- CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();
