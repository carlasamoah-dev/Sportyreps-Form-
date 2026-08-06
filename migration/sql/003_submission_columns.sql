-- 003_submission_columns.sql
--
-- The table half of 001, on its own and safe to run repeatedly.
--
-- Split out for the same reason as 002: the SQL Editor runs a script as one
-- transaction, so if the storage policies at the end of 001 were refused, these
-- columns were rolled back too and the run appeared to succeed. Without them the
-- final step of the migration cannot write a single row, and it would not find
-- that out until every file had already been uploaded.
--
-- Run 002 and 003 separately. Neither can undo the other.


-- ── Provenance ────────────────────────────────────────────────────────────────
-- source_response_id is what makes the import idempotent: re-running updates the
-- same player instead of creating a second copy of them.
ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS source_response_id  text,
    ADD COLUMN IF NOT EXISTS source_submitted_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS source_network_id   text,
    ADD COLUMN IF NOT EXISTS source_media        jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_source_response_id
    ON public.submissions (source_response_id)
 WHERE source_response_id IS NOT NULL;


-- ── Columns the app already expects ───────────────────────────────────────────
-- The admin panel reads response_type, and the form collects the company fields,
-- but the table may predate them.
ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS response_type text;

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS "rep-contact_rep_company"    text,
    ADD COLUMN IF NOT EXISTS "talent-info-for-rep_company" text;


-- ── What you should see ───────────────────────────────────────────────────────
-- Seven rows. Anything missing means this did not apply.
SELECT column_name
  FROM information_schema.columns
 WHERE table_name = 'submissions'
   AND column_name IN (
        'source_response_id', 'source_submitted_at', 'source_network_id',
        'source_media', 'response_type',
        'rep-contact_rep_company', 'talent-info-for-rep_company')
 ORDER BY column_name;
