-- Add unique constraint on date for upsert support
ALTER TABLE company_metrics ADD CONSTRAINT company_metrics_date_unique UNIQUE (date);
