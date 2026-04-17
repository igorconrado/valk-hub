-- Sprint 3: Meetings, Decisions, Action Items & Reports
-- Applied to production on 2026-04-17

-- MEETINGS
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'internal' CHECK (type IN ('internal', 'standup', 'review', 'planning', 'retro', 'external', 'one_on_one')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  recording_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MEETING PARTICIPANTS
CREATE TABLE meeting_participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'optional')),
  rsvp TEXT DEFAULT 'pending' CHECK (rsvp IN ('pending', 'accepted', 'declined', 'tentative')),
  PRIMARY KEY (meeting_id, user_id)
);

-- DECISIONS
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'rejected', 'deferred', 'superseded')),
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES users(id),
  context TEXT,
  rationale TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ACTION ITEMS (from meetings or standalone)
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REPORTS
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('weekly', 'monthly', 'quarterly', 'custom', 'investor')),
  period_start DATE,
  period_end DATE,
  content TEXT,
  data_json JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes: meetings
CREATE INDEX idx_meetings_project ON meetings(project_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meeting_participants_user ON meeting_participants(user_id);

-- Indexes: decisions
CREATE INDEX idx_decisions_project ON decisions(project_id);
CREATE INDEX idx_decisions_meeting ON decisions(meeting_id);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_created_at ON decisions(created_at DESC);

-- Indexes: action items
CREATE INDEX idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX idx_action_items_assignee ON action_items(assignee_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_due_date ON action_items(due_date);
CREATE INDEX idx_action_items_task ON action_items(task_id);

-- Indexes: reports
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Meetings policies
CREATE POLICY "Meetings: select for authenticated" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Meetings: insert for admin/operator" ON meetings FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Meetings: update for admin/operator" ON meetings FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Meetings: delete for admin" ON meetings FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Meeting participants policies
CREATE POLICY "Participants: select for authenticated" ON meeting_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Participants: insert for admin/operator" ON meeting_participants FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Participants: delete for admin/operator" ON meeting_participants FOR DELETE TO authenticated USING (get_user_role() IN ('admin', 'operator'));

-- Decisions policies
CREATE POLICY "Decisions: select for authenticated" ON decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Decisions: insert for admin/operator" ON decisions FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Decisions: update for admin/operator" ON decisions FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Decisions: delete for admin" ON decisions FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Action items policies
CREATE POLICY "Action items: select for authenticated" ON action_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Action items: insert for admin/operator" ON action_items FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Action items: update for admin/operator" ON action_items FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Action items: delete for admin" ON action_items FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Reports policies
CREATE POLICY "Reports: select for authenticated" ON reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reports: insert for admin/operator" ON reports FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Reports: update for admin/operator" ON reports FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Reports: delete for admin" ON reports FOR DELETE TO authenticated USING (get_user_role() = 'admin');
