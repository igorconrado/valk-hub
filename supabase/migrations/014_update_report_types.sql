-- Update report types to match business terminology
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_type_check CHECK (type IN ('sprint', 'monthly', 'experiment', 'quarterly', 'custom'));

-- Migrate existing rows
UPDATE reports SET type = 'sprint' WHERE type = 'weekly';
UPDATE reports SET type = 'experiment' WHERE type = 'investor';

-- Add ai_generated flag
ALTER TABLE reports ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
