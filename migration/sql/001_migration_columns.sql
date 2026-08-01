-- ==============================================================================
-- 001_migration_columns.sql
-- ==============================================================================
-- Run this in the Supabase SQL Editor BEFORE importing the 2023/2024 Typeform
-- responses. It does three things:
--
--   A. adds the provenance columns the import needs to stay idempotent
--   B. adds the columns the admin panel already reads but the schema never had
--   C. widens the storage buckets so the legacy files can actually be stored
--
-- Every statement is safe to run more than once.
-- ==============================================================================


-- ── A. Provenance ─────────────────────────────────────────────────────────────
-- source_response_id is the Typeform response id. The unique index is what makes
-- a re-run of the importer update rather than duplicate.

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS source_response_id  text,
    ADD COLUMN IF NOT EXISTS source_submitted_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS source_network_id   text,
    ADD COLUMN IF NOT EXISTS source_media        jsonb;

COMMENT ON COLUMN public.submissions.source_response_id IS
  'Typeform response id for records migrated from the 2023/2024 form. NULL for submissions made through the current form.';
COMMENT ON COLUMN public.submissions.source_media IS
  'Per-slot provenance for migrated files: original filename, sha256 and Typeform file hash.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_source_response_id
    ON public.submissions (source_response_id)
    WHERE source_response_id IS NOT NULL;


-- ── B. Columns the admin panel expects ────────────────────────────────────────
-- admin/js/constants.js renders a "Response type" column that has never existed
-- in the table, so it always shows blank.

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS response_type text;

-- The Typeform asked representatives and talents for a company name. The live
-- form does not, but the legacy answers exist and would otherwise be discarded.
ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS "rep-contact_rep_company" text,
    ADD COLUMN IF NOT EXISTS "talent-info-for-rep_company" text;


-- ── C. Storage buckets ────────────────────────────────────────────────────────
-- The cvs bucket only allows application/pdf, but the live form has accepted
-- DOCX since commit cbf8396, so DOCX uploads fail today. The legacy export also
-- contains DOC and PPTX files in the CV slot.

UPDATE storage.buckets
   SET allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
       ]
 WHERE id = 'cvs';

-- Two legacy CV slots contain .MOV video. Neither existing bucket accepts video,
-- so they get their own bucket rather than being dropped.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['video/quicktime', 'video/mp4'])
ON CONFLICT (id) DO UPDATE
    SET public             = EXCLUDED.public,
        file_size_limit    = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

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


-- ── Verify ────────────────────────────────────────────────────────────────────
--   SELECT id, allowed_mime_types FROM storage.buckets;
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'submissions' AND column_name LIKE 'source%';
