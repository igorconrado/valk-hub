INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-logos',
  'project-logos',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Project logos: read for everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-logos');

CREATE POLICY "Project logos: upload for admin/operator"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-logos'
  AND get_user_role() IN ('admin', 'operator')
);

CREATE POLICY "Project logos: update for admin/operator"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-logos'
  AND get_user_role() IN ('admin', 'operator')
);

CREATE POLICY "Project logos: delete for admin/operator"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-logos'
  AND get_user_role() IN ('admin', 'operator')
);
