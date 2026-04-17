-- Sprint 2: Documents & Document Versions
-- Applied to production on 2026-04-17

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Sem titulo',
  content TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'livre' CHECK (type IN ('contexto', 'prd', 'spec', 'aprendizado', 'ata', 'template', 'relatorio', 'livre')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  search_vector TSVECTOR,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENT VERSIONS (auto-populated by trigger)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX idx_documents_search ON documents USING GIN (search_vector);
CREATE INDEX idx_document_versions_doc ON document_versions(document_id);
CREATE INDEX idx_document_versions_version ON document_versions(document_id, version DESC);

-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION documents_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content ON documents
  FOR EACH ROW
  EXECUTE FUNCTION documents_update_search_vector();

-- Auto-version: save snapshot to document_versions on update
CREATE OR REPLACE FUNCTION documents_auto_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only version when content or title actually changed
  IF OLD.title IS DISTINCT FROM NEW.title OR OLD.content IS DISTINCT FROM NEW.content THEN
    -- Save the OLD version
    INSERT INTO document_versions (document_id, version, title, content, created_by)
    VALUES (OLD.id, OLD.version, OLD.title, OLD.content, OLD.created_by);

    -- Increment version on the new row
    NEW.version := OLD.version + 1;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_auto_version_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION documents_auto_version();

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Documents: select for authenticated" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Documents: insert for admin/operator" ON documents FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Documents: update for admin/operator" ON documents FOR UPDATE TO authenticated USING (get_user_role() IN ('admin', 'operator'));
CREATE POLICY "Documents: delete for admin" ON documents FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- Document versions policies
CREATE POLICY "Doc versions: select for authenticated" ON document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doc versions: insert for authenticated" ON document_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Doc versions: delete for admin" ON document_versions FOR DELETE TO authenticated USING (get_user_role() = 'admin');
