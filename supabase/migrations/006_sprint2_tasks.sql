-- Sprint 2: Tasks & Task Blocks
-- Applied to production on 2026-04-16

-- TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('dev', 'task', 'meeting_prep', 'report', 'research', 'decision')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'doing', 'on_hold', 'review', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  linear_issue_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TASK BLOCKS
CREATE TABLE task_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  blocked_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_linear_issue ON tasks(linear_issue_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_task_blocks_task ON task_blocks(task_id);
CREATE INDEX idx_task_blocks_resolved ON task_blocks(task_id, resolved);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_blocks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Tasks: select for authenticated" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks: insert for admin/operator" ON tasks FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Tasks: update for admin/operator" ON tasks FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Tasks: delete for admin" ON tasks FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Task blocks policies
CREATE POLICY "Task blocks: select for authenticated" ON task_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Task blocks: insert for admin/operator" ON task_blocks FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Task blocks: update for admin/operator" ON task_blocks FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
