-- ============================================================================
-- 021: Tight RLS for tables that fell outside 019
-- (sprints, project_gates, triage_decisions)
-- Applied directly to remote DB on 2026-04-21. This file exists in the repo
-- only to keep migration history in sync.
-- ============================================================================

-- SPRINTS
DROP POLICY IF EXISTS "sprints_select_all" ON sprints;
DROP POLICY IF EXISTS "sprints_modify_all" ON sprints;

CREATE POLICY sprints_select_scoped ON sprints FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY sprints_insert_scoped ON sprints FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY sprints_update_scoped ON sprints FOR UPDATE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id))
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY sprints_delete_scoped ON sprints FOR DELETE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id));

-- PROJECT_GATES
DROP POLICY IF EXISTS "project_gates_select_all" ON project_gates;
DROP POLICY IF EXISTS "project_gates_modify_all" ON project_gates;

CREATE POLICY project_gates_select_scoped ON project_gates FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY project_gates_insert_scoped ON project_gates FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY project_gates_update_scoped ON project_gates FOR UPDATE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id))
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY project_gates_delete_scoped ON project_gates FOR DELETE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id));

-- TRIAGE_DECISIONS
DROP POLICY IF EXISTS "triage_decisions_select_all" ON triage_decisions;
DROP POLICY IF EXISTS "triage_decisions_insert_all" ON triage_decisions;

CREATE POLICY triage_decisions_select_scoped ON triage_decisions FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY triage_decisions_insert_scoped ON triage_decisions FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY triage_decisions_delete_admin ON triage_decisions FOR DELETE TO authenticated
  USING (is_current_user_admin());
