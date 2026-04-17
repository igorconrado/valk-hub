-- Sprint 2: Linear Sync Configuration, Logs & Cycles
-- Applied to production on 2026-04-16

-- LINEAR SYNC CONFIG (one per project)
CREATE TABLE linear_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  sync_enabled BOOLEAN DEFAULT true,
  webhook_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LINEAR SYNC LOG (audit trail for all sync operations)
CREATE TABLE linear_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  linear_issue_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LINEAR CYCLES (synced from Linear)
CREATE TABLE linear_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linear_cycle_id TEXT NOT NULL UNIQUE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  linear_team_id TEXT NOT NULL,
  name TEXT,
  number INTEGER,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_linear_sync_config_team ON linear_sync_config(team_id);
CREATE INDEX idx_linear_sync_log_project ON linear_sync_log(project_id);
CREATE INDEX idx_linear_sync_log_task ON linear_sync_log(task_id);
CREATE INDEX idx_linear_sync_log_created ON linear_sync_log(created_at DESC);
CREATE INDEX idx_linear_cycles_project ON linear_cycles(project_id);
CREATE INDEX idx_linear_cycles_team ON linear_cycles(linear_team_id);
CREATE INDEX idx_linear_cycles_dates ON linear_cycles(starts_at, ends_at);

-- Enable RLS
ALTER TABLE linear_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE linear_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE linear_cycles ENABLE ROW LEVEL SECURITY;

-- Linear sync config policies
CREATE POLICY "Linear config: select for authenticated" ON linear_sync_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Linear config: insert for admin" ON linear_sync_config FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Linear config: update for admin" ON linear_sync_config FOR UPDATE TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "Linear config: delete for admin" ON linear_sync_config FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Linear sync log policies (anyone authenticated can read, system inserts)
CREATE POLICY "Linear log: select for authenticated" ON linear_sync_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Linear log: insert for authenticated" ON linear_sync_log FOR INSERT TO authenticated WITH CHECK (true);

-- Linear cycles policies
CREATE POLICY "Linear cycles: select for authenticated" ON linear_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Linear cycles: insert for authenticated" ON linear_cycles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Linear cycles: update for authenticated" ON linear_cycles FOR UPDATE TO authenticated USING (true);
