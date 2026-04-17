-- Update meeting types to match business terminology
-- Old: internal, standup, review, planning, retro, external, one_on_one
-- New: daily_ops, biweekly, monthly, adhoc

ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_type_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_type_check CHECK (type IN ('daily_ops', 'biweekly', 'monthly', 'adhoc'));

-- Update existing rows to new types
UPDATE meetings SET type = 'daily_ops' WHERE type IN ('standup', 'internal');
UPDATE meetings SET type = 'adhoc' WHERE type IN ('review', 'planning', 'retro', 'external', 'one_on_one');

-- Change default
ALTER TABLE meetings ALTER COLUMN type SET DEFAULT 'adhoc';
