/**
 * check-supabase.js
 *
 * Confirms the Supabase project is actually ready before a single file is sent.
 *
 * This exists because it was not. The SQL Editor runs a script as one
 * transaction, so when the policy statements at the end of 001 were refused,
 * the bucket and column changes were rolled back with them and the run still
 * looked like it had worked. 200 files were uploaded before anything noticed,
 * 13 of them failed on it, and the missing columns would not have surfaced until
 * the very last step.
 *
 * Everything checked here is checkable in about a second, from the same
 * credentials the upload is about to use.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node migration/scripts/check-supabase.js
 *
 * Exit codes:  0 ready   4 something is missing   1 could not check
 */

const path = require('path');
const { DOC_EXTS, EXT_MIME } = require('./config');

const requireSupabase = () => {
  try {
    return require(path.join(__dirname, '..', '..', 'backend', 'node_modules', '@supabase', 'supabase-js'));
  } catch (_) {
    return require('@supabase/supabase-js');
  }
};

const DOC_MIMES = DOC_EXTS.map(e => EXT_MIME[e]);

const main = async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
    process.exit(1);
  }

  const { createClient } = requireSupabase();
  const supabase = createClient(url, key);
  const problems = [];

  // ── Buckets ─────────────────────────────────────────────────────────────────
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error(`Could not read the storage buckets: ${bucketError.message}`);
    process.exit(1);
  }
  const byId = new Map(buckets.map(b => [b.id, b]));

  for (const id of ['photos', 'cvs']) {
    if (!byId.has(id)) problems.push({ what: `the '${id}' bucket does not exist`, fix: '002_storage_buckets.sql' });
  }
  if (!byId.has('media')) {
    problems.push({ what: "the 'media' bucket does not exist, so the two .MOV CVs have nowhere to go", fix: '002_storage_buckets.sql' });
  }

  const cvs = byId.get('cvs');
  if (cvs && Array.isArray(cvs.allowed_mime_types)) {
    const missing = DOC_MIMES.filter(m => !cvs.allowed_mime_types.includes(m));
    if (missing.length) {
      problems.push({
        what: `the 'cvs' bucket rejects ${missing.length} document type(s) the export contains: ${missing.join(', ')}`,
        fix: '002_storage_buckets.sql',
      });
    }
  }

  // ── Columns ─────────────────────────────────────────────────────────────────
  // A select against a missing column errors rather than returning nothing, so
  // this is a real existence check and not an emptiness check.
  const { error: colError } = await supabase
    .from('submissions')
    .select('source_response_id, source_submitted_at, source_media, response_type')
    .limit(1);

  if (colError) {
    problems.push({
      what: `the submissions table is missing the migration columns (${colError.message})`,
      fix: '003_submission_columns.sql',
    });
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (!problems.length) {
    console.log('Supabase is ready: buckets accept every file type in this export, and the submissions table has the columns.');
    return;
  }

  console.log('Supabase is not ready yet:\n');
  for (const p of problems) console.log(`  - ${p.what}`);

  const files = [...new Set(problems.map(p => p.fix))].sort();
  console.log('\nIn Supabase, open the SQL Editor and run each of these, separately:\n');
  for (const f of files) console.log(`  migration/sql/${f}`);
  console.log('\nRun them one at a time. The editor treats a script as all-or-nothing,');
  console.log('so a later statement failing quietly undoes the earlier ones.');
  process.exit(4);
};

main().catch(err => { console.error(err); process.exit(1); });
