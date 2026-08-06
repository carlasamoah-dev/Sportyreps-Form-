-- 002_storage_buckets.sql
--
-- The storage half of 001, on its own and safe to run as many times as you like.
--
-- Why it is split out: the Supabase SQL Editor runs a script as a single
-- transaction, so one failing statement silently undoes everything before it.
-- The policy statements at the end of 001 need ownership of storage.objects,
-- which not every project grants to the role running the editor. When that
-- failed it took the bucket changes down with it, and the bucket changes are
-- what 13 of the legacy files depend on:
--
--   .doc .docx .pptx  ->  "mime type ... is not supported"   (cvs bucket)
--   .mov              ->  "Bucket not found"                 (media bucket)
--
-- Nothing here can roll back anything else, and the policies are attempted in a
-- way that cannot take the buckets with them if they are refused.


-- ── The cvs bucket ────────────────────────────────────────────────────────────
-- It allows application/pdf only. The live form has accepted DOCX since cbf8396,
-- so DOCX uploads fail today regardless of this migration. The legacy export
-- also puts DOC and PPTX in the CV slot.
UPDATE storage.buckets
   SET allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
       ]
 WHERE id = 'cvs';


-- ── The media bucket ──────────────────────────────────────────────────────────
-- Two legacy CV slots hold .MOV video. Neither existing bucket accepts video, so
-- it gets its own rather than the files being dropped.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['video/quicktime', 'video/mp4'])
ON CONFLICT (id) DO UPDATE
    SET public             = EXCLUDED.public,
        file_size_limit    = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ── Policies, attempted but not required ──────────────────────────────────────
-- The media bucket is public, so reads work through the public URL without
-- these. The migration uploads with the service role key, which bypasses RLS
-- entirely. So if this project will not let the editor create policies on
-- storage.objects, that is a notice rather than a failure, and the buckets above
-- stay applied either way.
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read access for Media" ON storage.objects;
    CREATE POLICY "Public read access for Media"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'media');

    DROP POLICY IF EXISTS "Allow uploads to Media bucket" ON storage.objects;
    CREATE POLICY "Allow uploads to Media bucket"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'media');

    DROP POLICY IF EXISTS "Allow admin delete for Media" ON storage.objects;
    CREATE POLICY "Allow admin delete for Media"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'media' AND auth.role() = 'authenticated');

    RAISE NOTICE 'Media bucket policies created.';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Not allowed to create policies on storage.objects. The buckets are still set; uploads use the service role key and public reads use the public URL, so this is not a problem for the migration.';
END $$;


-- ── What you should see ───────────────────────────────────────────────────────
-- cvs    with four mime types, media with two, and media public = true.
SELECT id, public, file_size_limit, allowed_mime_types
  FROM storage.buckets
 ORDER BY id;
