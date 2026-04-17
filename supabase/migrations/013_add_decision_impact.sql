-- Add impact column to decisions table
ALTER TABLE decisions ADD COLUMN impact TEXT DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'critical'));
