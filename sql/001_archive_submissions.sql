-- 001_archive_submissions.sql
--
-- Adds archiving to the admin panel: a submission can be taken out of the list
-- without being destroyed.
--
-- Deliberately not a DELETE. Supabase Storage has no recycle bin and neither
-- does Postgres, and for the migrated players the only other copy of their
-- photographs is a folder on one laptop. An archived row keeps its files and can
-- be restored; a deleted one cannot. A real purge can be added later, once there
-- is reason to trust that nothing archived is ever wanted back.
--
-- This is admin panel behaviour, not part of the Typeform back-migration. The
-- table itself is created by supabase_setup.sql at the repository root.
--
-- Safe to run repeatedly. Run it on its own: the SQL Editor treats a script as
-- one transaction, so a later statement failing undoes the earlier ones.

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

COMMENT ON COLUMN public.submissions.deleted_at IS
    'When this submission was archived from the admin panel. NULL means active. The row and its files are untouched; only the admin listing filters on this.';

-- Every ordinary listing asks for the active rows, so index only those. A
-- partial index stays small no matter how much is archived.
CREATE INDEX IF NOT EXISTS idx_submissions_active
    ON public.submissions (created_at DESC)
 WHERE deleted_at IS NULL;


-- ── Permissions ───────────────────────────────────────────────────────────────
-- Nothing to add. Archiving is an UPDATE, and supabase_setup.sql already grants
-- authenticated admins UPDATE on this table ("Enable update for admins"). The
-- backend acts as the logged-in admin by passing their JWT, so the existing
-- policy covers it.


-- ── What you should see ───────────────────────────────────────────────────────
-- One row: deleted_at, timestamp with time zone, nullable YES.
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'submissions'
   AND column_name = 'deleted_at';
