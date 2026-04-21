-- ============================================================================
-- 019: Tight RLS Policies — Defense in Depth
-- Replaces open "authenticated can do everything" policies with
-- membership-scoped and role-scoped access.
-- ============================================================================

-- ──────────────────────────────────────────────
-- 1. Helper functions
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION is_current_user_member_of(_project_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = _project_id
      AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
$$;

CREATE OR REPLACE FUNCTION is_current_user_owner_of(_project_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = _project_id
      AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
      AND role_in_project IN ('owner', 'admin')
  )
$$;

-- ──────────────────────────────────────────────
-- 2. PROJECTS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Projects: select for authenticated" ON projects;
DROP POLICY IF EXISTS "Projects: insert for admin/operator" ON projects;
DROP POLICY IF EXISTS "Projects: update for admin/operator" ON projects;
DROP POLICY IF EXISTS "Projects: delete for admin" ON projects;

CREATE POLICY projects_select_membership ON projects FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(id));

CREATE POLICY projects_insert_admin ON projects FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY projects_update_owner ON projects FOR UPDATE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(id))
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(id));

CREATE POLICY projects_delete_admin ON projects FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 3. PROJECT_MEMBERS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Members: select for authenticated" ON project_members;
DROP POLICY IF EXISTS "Members: insert for admin/operator" ON project_members;
DROP POLICY IF EXISTS "Members: delete for admin/operator" ON project_members;

CREATE POLICY project_members_select_scoped ON project_members FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR is_current_user_member_of(project_id)
    OR user_id = get_current_user_id()
  );

CREATE POLICY project_members_insert_owner ON project_members FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY project_members_delete_owner ON project_members FOR DELETE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id));

-- ──────────────────────────────────────────────
-- 4. TASKS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Tasks: select for authenticated" ON tasks;
DROP POLICY IF EXISTS "Tasks: insert for admin/operator" ON tasks;
DROP POLICY IF EXISTS "Tasks: update for admin/operator" ON tasks;
DROP POLICY IF EXISTS "Tasks: delete for admin" ON tasks;

CREATE POLICY tasks_select_scoped ON tasks FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY tasks_insert_scoped ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR (project_id IS NULL)
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY tasks_update_scoped ON tasks FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  )
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY tasks_delete_scoped ON tasks FOR DELETE TO authenticated
  USING (
    is_current_user_admin()
    OR is_current_user_owner_of(project_id)
  );

-- ──────────────────────────────────────────────
-- 5. TASK_BLOCKS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Task blocks: select for authenticated" ON task_blocks;
DROP POLICY IF EXISTS "Task blocks: insert for admin/operator" ON task_blocks;
DROP POLICY IF EXISTS "Task blocks: update for admin/operator" ON task_blocks;

CREATE POLICY task_blocks_select_scoped ON task_blocks FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_blocks.task_id
        AND (t.project_id IS NULL OR is_current_user_member_of(t.project_id))
    )
  );

CREATE POLICY task_blocks_insert_scoped ON task_blocks FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_blocks.task_id
        AND (t.project_id IS NULL OR is_current_user_member_of(t.project_id))
    )
  );

CREATE POLICY task_blocks_update_scoped ON task_blocks FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_blocks.task_id
        AND (t.project_id IS NULL OR is_current_user_member_of(t.project_id))
    )
  );

-- ──────────────────────────────────────────────
-- 6. DOCUMENTS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Documents: select for authenticated" ON documents;
DROP POLICY IF EXISTS "Documents: insert for admin/operator" ON documents;
DROP POLICY IF EXISTS "Documents: update for admin/operator" ON documents;
DROP POLICY IF EXISTS "Documents: delete for admin" ON documents;

CREATE POLICY documents_select_scoped ON documents FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY documents_insert_scoped ON documents FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY documents_update_scoped ON documents FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  )
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY documents_delete_scoped ON documents FOR DELETE TO authenticated
  USING (
    is_current_user_admin()
    OR is_current_user_owner_of(project_id)
  );

-- ──────────────────────────────────────────────
-- 7. DOCUMENT_VERSIONS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Doc versions: select for authenticated" ON document_versions;
DROP POLICY IF EXISTS "Doc versions: insert for authenticated" ON document_versions;
DROP POLICY IF EXISTS "Doc versions: delete for admin" ON document_versions;

CREATE POLICY doc_versions_select_scoped ON document_versions FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
        AND (d.project_id IS NULL OR is_current_user_member_of(d.project_id))
    )
  );

CREATE POLICY doc_versions_insert_scoped ON document_versions FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
        AND (d.project_id IS NULL OR is_current_user_member_of(d.project_id))
    )
  );

CREATE POLICY doc_versions_delete_scoped ON document_versions FOR DELETE TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
        AND is_current_user_owner_of(d.project_id)
    )
  );

-- ──────────────────────────────────────────────
-- 8. MEETINGS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Meetings: select for authenticated" ON meetings;
DROP POLICY IF EXISTS "Meetings: insert for admin/operator" ON meetings;
DROP POLICY IF EXISTS "Meetings: update for admin/operator" ON meetings;
DROP POLICY IF EXISTS "Meetings: delete for admin" ON meetings;

CREATE POLICY meetings_select_scoped ON meetings FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY meetings_insert_scoped ON meetings FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY meetings_update_scoped ON meetings FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  )
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY meetings_delete_scoped ON meetings FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 9. MEETING_PARTICIPANTS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Participants: select for authenticated" ON meeting_participants;
DROP POLICY IF EXISTS "Participants: insert for admin/operator" ON meeting_participants;
DROP POLICY IF EXISTS "Participants: delete for admin/operator" ON meeting_participants;

CREATE POLICY participants_select_scoped ON meeting_participants FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

CREATE POLICY participants_insert_scoped ON meeting_participants FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

CREATE POLICY participants_delete_scoped ON meeting_participants FOR DELETE TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

-- ──────────────────────────────────────────────
-- 10. DECISIONS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Decisions: select for authenticated" ON decisions;
DROP POLICY IF EXISTS "Decisions: insert for admin/operator" ON decisions;
DROP POLICY IF EXISTS "Decisions: update for admin/operator" ON decisions;
DROP POLICY IF EXISTS "Decisions: delete for admin" ON decisions;

CREATE POLICY decisions_select_scoped ON decisions FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY decisions_insert_scoped ON decisions FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY decisions_update_scoped ON decisions FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  )
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY decisions_delete_scoped ON decisions FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 11. ACTION_ITEMS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Action items: select for authenticated" ON action_items;
DROP POLICY IF EXISTS "Action items: insert for admin/operator" ON action_items;
DROP POLICY IF EXISTS "Action items: update for admin/operator" ON action_items;
DROP POLICY IF EXISTS "Action items: delete for admin" ON action_items;

CREATE POLICY action_items_select_scoped ON action_items FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = action_items.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

CREATE POLICY action_items_insert_scoped ON action_items FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = action_items.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

CREATE POLICY action_items_update_scoped ON action_items FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = action_items.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  )
  WITH CHECK (
    is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = action_items.meeting_id
        AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
    )
  );

CREATE POLICY action_items_delete_scoped ON action_items FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 12. REPORTS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Reports: select for authenticated" ON reports;
DROP POLICY IF EXISTS "Reports: insert for admin/operator" ON reports;
DROP POLICY IF EXISTS "Reports: update for admin/operator" ON reports;
DROP POLICY IF EXISTS "Reports: delete for admin" ON reports;

CREATE POLICY reports_select_scoped ON reports FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY reports_insert_scoped ON reports FOR INSERT TO authenticated
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY reports_update_scoped ON reports FOR UPDATE TO authenticated
  USING (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  )
  WITH CHECK (
    is_current_user_admin()
    OR project_id IS NULL
    OR is_current_user_member_of(project_id)
  );

CREATE POLICY reports_delete_scoped ON reports FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 13. METRICS_SNAPSHOTS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Metrics: select for authenticated" ON metrics_snapshots;
DROP POLICY IF EXISTS "Metrics: insert for admin/operator" ON metrics_snapshots;
DROP POLICY IF EXISTS "Metrics: update for admin/operator" ON metrics_snapshots;
DROP POLICY IF EXISTS "Metrics: delete for admin" ON metrics_snapshots;

CREATE POLICY metrics_snapshots_select_scoped ON metrics_snapshots FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY metrics_snapshots_insert_scoped ON metrics_snapshots FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY metrics_snapshots_update_scoped ON metrics_snapshots FOR UPDATE TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id))
  WITH CHECK (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY metrics_snapshots_delete_scoped ON metrics_snapshots FOR DELETE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id));

-- ──────────────────────────────────────────────
-- 14. COMPANY_METRICS
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Company metrics: select for authenticated" ON company_metrics;
DROP POLICY IF EXISTS "Company metrics: insert for admin" ON company_metrics;
DROP POLICY IF EXISTS "Company metrics: update for admin" ON company_metrics;

CREATE POLICY company_metrics_select_all ON company_metrics FOR SELECT TO authenticated
  USING (true);

CREATE POLICY company_metrics_modify_admin ON company_metrics FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY company_metrics_update_admin ON company_metrics FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 15. ACTIVITY_LOG — Audit1 F-020
-- ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Activity: select for authenticated" ON activity_log;
DROP POLICY IF EXISTS "Activity: insert for authenticated" ON activity_log;

CREATE POLICY activity_log_select_scoped ON activity_log FOR SELECT TO authenticated
  USING (
    is_current_user_admin()
    OR user_id = get_current_user_id()
    OR (
      entity_type = 'task' AND EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.id = activity_log.entity_id
          AND (t.project_id IS NULL OR is_current_user_member_of(t.project_id))
      )
    )
    OR (
      entity_type = 'project' AND is_current_user_member_of(entity_id)
    )
    OR (
      entity_type = 'document' AND EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = activity_log.entity_id
          AND (d.project_id IS NULL OR is_current_user_member_of(d.project_id))
      )
    )
    OR (
      entity_type = 'meeting' AND EXISTS (
        SELECT 1 FROM meetings m
        WHERE m.id = activity_log.entity_id
          AND (m.project_id IS NULL OR is_current_user_member_of(m.project_id))
      )
    )
    OR (
      entity_type = 'decision' AND EXISTS (
        SELECT 1 FROM decisions d
        WHERE d.id = activity_log.entity_id
          AND (d.project_id IS NULL OR is_current_user_member_of(d.project_id))
      )
    )
  );

-- Insert: any authenticated user can create activity entries
CREATE POLICY activity_log_insert_auth ON activity_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- Delete: only admin (for cleanup during project deletion)
CREATE POLICY activity_log_delete_admin ON activity_log FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- ──────────────────────────────────────────────
-- 16. LINEAR tables (keep broad — syncing is automated)
-- ──────────────────────────────────────────────

-- linear_sync_config: scoped to project owners
DROP POLICY IF EXISTS "Linear config: select for authenticated" ON linear_sync_config;
DROP POLICY IF EXISTS "Linear config: insert for admin" ON linear_sync_config;
DROP POLICY IF EXISTS "Linear config: update for admin" ON linear_sync_config;
DROP POLICY IF EXISTS "Linear config: delete for admin" ON linear_sync_config;

CREATE POLICY linear_config_select_scoped ON linear_sync_config FOR SELECT TO authenticated
  USING (is_current_user_admin() OR is_current_user_member_of(project_id));

CREATE POLICY linear_config_modify_owner ON linear_sync_config FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY linear_config_update_owner ON linear_sync_config FOR UPDATE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id))
  WITH CHECK (is_current_user_admin() OR is_current_user_owner_of(project_id));

CREATE POLICY linear_config_delete_owner ON linear_sync_config FOR DELETE TO authenticated
  USING (is_current_user_admin() OR is_current_user_owner_of(project_id));

-- linear_sync_log, linear_cycles: keep open for reading (system tables)
-- No changes needed — they're low-risk and used by automated sync
