-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "task_assigned": true,
    "task_blocked": true,
    "meeting_scheduled": true,
    "meeting_reminder": true,
    "decision_registered": true,
    "action_item_assigned": true,
    "report_published": true
  }',
  default_task_view TEXT NOT NULL DEFAULT 'list' CHECK (default_task_view IN ('list', 'kanban')),
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings: select own" ON user_settings FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Settings: insert own" ON user_settings FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Settings: update own" ON user_settings FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
