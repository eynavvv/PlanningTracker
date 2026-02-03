-- Create initiative_updates table for Activity Feed
CREATE TABLE IF NOT EXISTS initiative_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_initiative_updates_initiative_id ON initiative_updates(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_updates_created_at ON initiative_updates(created_at DESC);

-- Enable RLS
ALTER TABLE initiative_updates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on initiative_updates" ON initiative_updates FOR ALL USING (true);
