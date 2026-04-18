-- Onboarding progress tracking
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, step_key)
);

CREATE INDEX idx_onboarding_user ON onboarding_progress(user_id);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Onboarding: select own" ON onboarding_progress FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Onboarding: insert for authenticated" ON onboarding_progress FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Onboarding: delete for admin" ON onboarding_progress FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');
