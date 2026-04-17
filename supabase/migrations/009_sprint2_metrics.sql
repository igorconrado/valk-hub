-- Sprint 2: Metrics Snapshots & Company Metrics
-- Applied to production on 2026-04-17

-- METRICS SNAPSHOTS (per product, manual or automated)
CREATE TABLE metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data_json JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'stripe', 'api')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COMPANY METRICS (aggregated, optional future use)
CREATE TABLE company_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_mrr NUMERIC,
  total_clients INTEGER,
  runway_months NUMERIC,
  burn_rate NUMERIC,
  data_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_metrics_snapshots_project ON metrics_snapshots(project_id);
CREATE INDEX idx_metrics_snapshots_date ON metrics_snapshots(date DESC);
CREATE INDEX idx_metrics_snapshots_project_date ON metrics_snapshots(project_id, date DESC);
CREATE INDEX idx_company_metrics_date ON company_metrics(date DESC);

-- Enable RLS
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_metrics ENABLE ROW LEVEL SECURITY;

-- Metrics snapshots policies
CREATE POLICY "Metrics: select for authenticated" ON metrics_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Metrics: insert for admin/operator" ON metrics_snapshots FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Metrics: update for admin/operator" ON metrics_snapshots FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Metrics: delete for admin" ON metrics_snapshots FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Company metrics policies
CREATE POLICY "Company metrics: select for authenticated" ON company_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Company metrics: insert for admin" ON company_metrics FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Company metrics: update for admin" ON company_metrics FOR UPDATE TO authenticated USING (get_user_role() = 'admin');
