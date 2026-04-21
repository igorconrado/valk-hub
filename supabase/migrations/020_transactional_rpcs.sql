-- ============================================================================
-- 020: Transactional RPCs + Activity Log Triggers
-- ============================================================================

-- ──────────────────────────────────────────────
-- 1. delete_document_transactional
-- Deletes versions → activity → document atomically
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION delete_document_transactional(
  p_document_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
BEGIN
  -- Get title for activity log
  SELECT title INTO v_title FROM documents WHERE id = p_document_id;
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Document not found' USING ERRCODE = 'P0002';
  END IF;

  -- Delete versions
  DELETE FROM document_versions WHERE document_id = p_document_id;

  -- Delete existing activity entries
  DELETE FROM activity_log
  WHERE entity_type = 'document' AND entity_id = p_document_id;

  -- Delete the document
  DELETE FROM documents WHERE id = p_document_id;

  -- Log deletion
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, 'deleted_document', 'document', p_document_id,
    jsonb_build_object('title', v_title));
END;
$$;

GRANT EXECUTE ON FUNCTION delete_document_transactional(UUID, UUID) TO authenticated;

-- ──────────────────────────────────────────────
-- 2. create_action_item_with_task
-- Creates task + action_item + activity atomically
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_action_item_with_task(
  p_meeting_id UUID,
  p_project_id UUID,
  p_title TEXT,
  p_assignee_id UUID,
  p_due_date DATE,
  p_created_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id UUID;
  v_action_item_id UUID;
BEGIN
  -- Create task
  INSERT INTO tasks (title, type, project_id, assignee_id, status, priority, due_date, created_by)
  VALUES (p_title, 'task', p_project_id, p_assignee_id, 'backlog', 'medium', p_due_date, p_created_by)
  RETURNING id INTO v_task_id;

  -- Create action item linked to task
  INSERT INTO action_items (meeting_id, task_id, title, assignee_id, due_date, status, created_by)
  VALUES (p_meeting_id, v_task_id, p_title, p_assignee_id, p_due_date, 'pending', p_created_by)
  RETURNING id INTO v_action_item_id;

  -- Log activity
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_created_by, 'created_action_item', 'meeting', p_meeting_id,
    jsonb_build_object('title', p_title, 'assignee_id', p_assignee_id));

  RETURN json_build_object('task_id', v_task_id, 'action_item_id', v_action_item_id);
END;
$$;

GRANT EXECUTE ON FUNCTION create_action_item_with_task(UUID, UUID, TEXT, UUID, DATE, UUID) TO authenticated;

-- ──────────────────────────────────────────────
-- 3. delete_project_transactional
-- Deletes activity → project atomically, verifies success
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION delete_project_transactional(
  p_project_id UUID,
  p_user_id UUID,
  p_project_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete related activity
  DELETE FROM activity_log
  WHERE entity_type = 'project' AND entity_id = p_project_id;

  -- Delete project (CASCADE handles members, etc.)
  DELETE FROM projects WHERE id = p_project_id;

  -- Log deletion
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, 'deleted_project', 'project', p_project_id,
    jsonb_build_object('project_name', p_project_name));
END;
$$;

GRANT EXECUTE ON FUNCTION delete_project_transactional(UUID, UUID, TEXT) TO authenticated;

-- ──────────────────────────────────────────────
-- 4. Activity log triggers for task changes
-- ──────────────────────────────────────────────

-- Status change
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_user_id := get_current_user_id();
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    INSERT INTO activity_log (entity_type, entity_id, user_id, action, metadata)
    VALUES ('task', NEW.id, v_user_id, 'status_changed',
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'task_title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_task_status_change ON tasks;
CREATE TRIGGER trigger_log_task_status_change
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_status_change();

-- Assignee change
CREATE OR REPLACE FUNCTION log_task_assignee_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
    v_user_id := get_current_user_id();
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    INSERT INTO activity_log (entity_type, entity_id, user_id, action, metadata)
    VALUES ('task', NEW.id, v_user_id, 'assignee_changed',
      jsonb_build_object('from', OLD.assignee_id, 'to', NEW.assignee_id, 'task_title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_task_assignee_change ON tasks;
CREATE TRIGGER trigger_log_task_assignee_change
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_assignee_change();

-- Priority change
CREATE OR REPLACE FUNCTION log_task_priority_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    v_user_id := get_current_user_id();
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    INSERT INTO activity_log (entity_type, entity_id, user_id, action, metadata)
    VALUES ('task', NEW.id, v_user_id, 'priority_changed',
      jsonb_build_object('from', OLD.priority, 'to', NEW.priority, 'task_title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_task_priority_change ON tasks;
CREATE TRIGGER trigger_log_task_priority_change
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_priority_change();

-- Subtask created (tasks with parent_task_id)
CREATE OR REPLACE FUNCTION log_subtask_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.parent_task_id IS NOT NULL THEN
    v_user_id := get_current_user_id();
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    INSERT INTO activity_log (entity_type, entity_id, user_id, action, metadata)
    VALUES ('task', NEW.parent_task_id, v_user_id, 'subtask_created',
      jsonb_build_object('subtask_id', NEW.id, 'subtask_title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_subtask_created ON tasks;
CREATE TRIGGER trigger_log_subtask_created
  AFTER INSERT ON tasks
  FOR EACH ROW
  WHEN (NEW.parent_task_id IS NOT NULL)
  EXECUTE FUNCTION log_subtask_created();

-- Subtask completed
CREATE OR REPLACE FUNCTION log_subtask_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.parent_task_id IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'done' THEN
    v_user_id := get_current_user_id();
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    INSERT INTO activity_log (entity_type, entity_id, user_id, action, metadata)
    VALUES ('task', NEW.parent_task_id, v_user_id, 'subtask_completed',
      jsonb_build_object('subtask_id', NEW.id, 'subtask_title', NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_subtask_completed ON tasks;
CREATE TRIGGER trigger_log_subtask_completed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  WHEN (NEW.parent_task_id IS NOT NULL)
  EXECUTE FUNCTION log_subtask_completed();
