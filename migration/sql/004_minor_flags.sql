-- 004_minor_flags.sql
--
-- Makes a player's age at submission, and whether a guardian is on the record,
-- visible on the record itself.
--
-- Eleven of the legacy responses were completed by guardians on behalf of
-- players aged 12 to 17. They are being imported, which is a reasonable call
-- given how they were collected, but the live form turns under-18s away, so
-- anyone meeting these records later will reasonably assume every player is an
-- adult. Date of birth alone does not fix that: it needs reading, comparing to
-- the submission date, and knowing to look in the first place.
--
-- These three columns are filled for every imported player, not only the
-- minors, so "false" means checked and false rather than not recorded.
--
-- Safe to run repeatedly. Run it on its own.

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS is_minor_at_submission boolean,
    ADD COLUMN IF NOT EXISTS age_at_submission      smallint,
    ADD COLUMN IF NOT EXISTS guardian_on_record     boolean;

COMMENT ON COLUMN public.submissions.is_minor_at_submission IS
    'Under 18 on the day they submitted, computed from date of birth against the submission date, not self-reported age.';
COMMENT ON COLUMN public.submissions.age_at_submission IS
    'Age in whole years on the submission date.';
COMMENT ON COLUMN public.submissions.guardian_on_record IS
    'A representative or guardian name, phone or email is present on this record.';

-- Finding them later without needing to know the column exists.
CREATE INDEX IF NOT EXISTS idx_submissions_is_minor
    ON public.submissions (is_minor_at_submission)
 WHERE is_minor_at_submission;


-- ── What you should see ───────────────────────────────────────────────────────
-- Three rows.
SELECT column_name, data_type
  FROM information_schema.columns
 WHERE table_name = 'submissions'
   AND column_name IN ('is_minor_at_submission', 'age_at_submission', 'guardian_on_record')
 ORDER BY column_name;
