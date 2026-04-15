-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'stakeholder')),
  company_role TEXT,
  avatar_url TEXT,
  bio TEXT,
  responsibilities TEXT,
  dedication TEXT CHECK (dedication IN ('full_time', 'partial')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'discovery' CHECK (phase IN ('discovery', 'mvp', 'validation', 'traction', 'scale', 'paused', 'closed')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  owner_id UUID REFERENCES users(id),
  thesis_type TEXT CHECK (thesis_type IN ('b2c', 'b2b')),
  thesis_hypothesis TEXT,
  linear_team_id TEXT,
  launch_target DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECT MEMBERS
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_in_project TEXT DEFAULT 'member',
  PRIMARY KEY (project_id, user_id)
);

-- ACTIVITY LOG
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get the logged-in user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users policies
CREATE POLICY "Users: select for authenticated" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users: insert for admin" ON users FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Users: update for admin" ON users FOR UPDATE TO authenticated USING (get_user_role() = 'admin');

-- Projects policies
CREATE POLICY "Projects: select for authenticated" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects: insert for admin/operator" ON projects FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Projects: update for admin/operator" ON projects FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Projects: delete for admin" ON projects FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Project members policies
CREATE POLICY "Members: select for authenticated" ON project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members: insert for admin/operator" ON project_members FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Members: delete for admin/operator" ON project_members FOR DELETE TO authenticated USING (get_user_role() IN ('admin', 'operator'));

-- Activity log policies
CREATE POLICY "Activity: select for authenticated" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activity: insert for authenticated" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
