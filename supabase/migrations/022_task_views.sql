-- ============================================================================
-- 022: Task Views System
-- Saved filter presets: system views (built-in), workspace views (admin),
-- personal views (per user). Favorites per user.
-- ============================================================================

CREATE TABLE task_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  scope TEXT NOT NULL DEFAULT 'personal' CHECK (scope IN ('system', 'workspace', 'personal')),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filters JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_view_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_id UUID NOT NULL REFERENCES task_views(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, view_id)
);

ALTER TABLE task_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_view_favorites ENABLE ROW LEVEL SECURITY;

-- RLS: task_views
CREATE POLICY task_views_select ON task_views FOR SELECT TO authenticated
  USING (
    scope = 'system'
    OR scope = 'workspace'
    OR (scope = 'personal' AND owner_id = get_current_user_id())
  );

CREATE POLICY task_views_insert ON task_views FOR INSERT TO authenticated
  WITH CHECK (
    (scope = 'workspace' AND is_current_user_admin())
    OR (scope = 'personal' AND owner_id = get_current_user_id())
  );

CREATE POLICY task_views_update ON task_views FOR UPDATE TO authenticated
  USING (
    (scope = 'workspace' AND is_current_user_admin())
    OR (scope = 'personal' AND owner_id = get_current_user_id())
  );

CREATE POLICY task_views_delete ON task_views FOR DELETE TO authenticated
  USING (
    (scope = 'workspace' AND is_current_user_admin())
    OR (scope = 'personal' AND owner_id = get_current_user_id())
  );

-- RLS: favorites
CREATE POLICY view_favorites_select ON task_view_favorites FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY view_favorites_insert ON task_view_favorites FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY view_favorites_delete ON task_view_favorites FOR DELETE TO authenticated
  USING (user_id = get_current_user_id());

-- Seed system views
INSERT INTO task_views (slug, name, icon, scope, filters, sort_order) VALUES
  ('my-tasks',       'Minhas tasks',     'User',        'system', '{"assignee_id": "me"}', 1),
  ('active-sprint',  'Sprint ativa',     'Zap',         'system', '{"sprint_id": "active"}', 2),
  ('unassigned',     'Sem responsavel',  'AlertCircle', 'system', '{"assignee_id": "unassigned"}', 3),
  ('overdue',        'Atrasadas',        'Clock',       'system', '{"due_date_filter": "overdue"}', 4),
  ('all-tasks',      'Todas',            'Layers',      'system', '{}', 5);

-- RPC: get visible views with favorite status
CREATE OR REPLACE FUNCTION get_visible_task_views()
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  icon TEXT,
  scope TEXT,
  owner_id UUID,
  filters JSONB,
  sort_order INT,
  is_favorited BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.id, v.slug, v.name, v.icon, v.scope, v.owner_id, v.filters, v.sort_order,
    EXISTS (
      SELECT 1 FROM task_view_favorites f
      WHERE f.view_id = v.id AND f.user_id = get_current_user_id()
    ) AS is_favorited
  FROM task_views v
  WHERE
    v.scope = 'system'
    OR v.scope = 'workspace'
    OR (v.scope = 'personal' AND v.owner_id = get_current_user_id())
  ORDER BY v.sort_order, v.created_at;
$$;

GRANT EXECUTE ON FUNCTION get_visible_task_views() TO authenticated;

-- RPC: toggle favorite
CREATE OR REPLACE FUNCTION toggle_view_favorite(p_view_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := get_current_user_id();
  SELECT EXISTS (
    SELECT 1 FROM task_view_favorites WHERE user_id = v_user_id AND view_id = p_view_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM task_view_favorites WHERE user_id = v_user_id AND view_id = p_view_id;
    RETURN FALSE;
  ELSE
    INSERT INTO task_view_favorites (user_id, view_id) VALUES (v_user_id, p_view_id);
    RETURN TRUE;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_view_favorite(UUID) TO authenticated;
