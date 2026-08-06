-- 005_fix_source_index.sql
--
-- Fixes:  insert failed: there is no unique or exclusion constraint matching
--         the ON CONFLICT specification
--
-- 003 created the uniqueness on source_response_id as a PARTIAL index:
--
--     CREATE UNIQUE INDEX ... ON submissions (source_response_id)
--      WHERE source_response_id IS NOT NULL;
--
-- Postgres will only use a partial index for ON CONFLICT if the statement
-- repeats the index's WHERE clause, and the upsert issued through PostgREST
-- cannot do that. So the index exists, is correct, and is invisible to the
-- thing that needs it.
--
-- The predicate was not buying anything either. A plain unique index already
-- allows any number of NULLs, because Postgres treats NULLs as distinct, so the
-- rows that came through the live form and have no source_response_id are
-- unaffected either way.
--
-- Safe to run repeatedly. Run it on its own.

DROP INDEX IF EXISTS public.idx_submissions_source_response_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_source_response_id
    ON public.submissions (source_response_id);


-- ── What you should see ───────────────────────────────────────────────────────
-- One row, and the definition must NOT contain the word WHERE.
SELECT indexname, indexdef
  FROM pg_indexes
 WHERE tablename = 'submissions'
   AND indexname = 'idx_submissions_source_response_id';
