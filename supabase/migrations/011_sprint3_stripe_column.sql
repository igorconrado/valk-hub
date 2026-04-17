-- Sprint 3: Add Stripe product ID to projects
-- Applied to production on 2026-04-17

ALTER TABLE projects ADD COLUMN stripe_product_id TEXT;

CREATE INDEX idx_projects_stripe ON projects(stripe_product_id);
