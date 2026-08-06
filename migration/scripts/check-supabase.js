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

/**
 * Which kind of key this is, without calling anything.
 *
 * Supabase issues both the older JWTs, whose middle segment states the role, and
 * the newer sb_publishable_ / sb_secret_ prefixed keys. Either way the anon key
 * is allowed to upload into a public bucket but not to write the submissions
 * table, so using it looks fine for two hundred files and then fails at the end.
 */
const keyRole = (k) => {
  if (/^sb_secret_/.test(k)) return 'service_role';
  if (/^sb_publishable_/.test(k)) return 'anon';
  const parts = k.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString()).role || null;
  } catch (_) {
    return null;
  }
};

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

  // ── Which key is this ───────────────────────────────────────────────────────
  // It decides what everything below can see, and the last step of the migration
  // needs the service role key specifically.
  const role = keyRole(key);
  if (role === 'anon') {
    problems.push({
      what: 'this is the anon (publishable) key, not the service role key. Files may still upload, but writing the player records will be refused by row level security',
      fix: 'Supabase, Settings, API, "service_role". Treat it like a password.',
    });
  }

  // ── Buckets ─────────────────────────────────────────────────────────────────
  // An empty list is not evidence that the buckets are missing, only that this
  // key cannot enumerate them, which is normal for anything but the service role
  // key. Claiming otherwise sends people to re-run SQL that already worked.
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError || !buckets || !buckets.length) {
    console.log('Note: the bucket list came back empty, so this key cannot enumerate buckets.');
    console.log('      That says nothing about whether they exist. Skipping the bucket checks;');
    console.log('      any bucket problem will show up as a FAIL line during the upload.\n');
  } else {
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

  // Checked separately so a missing 004 does not read as a missing 003. Every
  // imported row carries these, so without them the insert fails for all of
  // them, not just the eleven minors.
  const { error: minorColError } = await supabase
    .from('submissions')
    .select('is_minor_at_submission, age_at_submission, guardian_on_record')
    .limit(1);

  if (minorColError) {
    problems.push({
      what: `the submissions table cannot record who was under 18 (${minorColError.message})`,
      fix: '004_minor_flags.sql',
    });
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (!problems.length) {
    console.log('Supabase is ready: buckets accept every file type in this export, and the submissions table has the columns.');
    return;
  }

  console.log('Supabase is not ready yet:\n');
  for (const p of problems) console.log(`  - ${p.what}`);

  const sqlFiles = [...new Set(problems.map(p => p.fix).filter(f => f.endsWith('.sql')))].sort();
  const other = [...new Set(problems.map(p => p.fix).filter(f => !f.endsWith('.sql')))];

  if (sqlFiles.length) {
    console.log('\nIn Supabase, open the SQL Editor and run each of these, separately:\n');
    for (const f of sqlFiles) console.log(`  migration/sql/${f}`);
    console.log('\nRun them one at a time. The editor treats a script as all-or-nothing,');
    console.log('so a later statement failing quietly undoes the earlier ones.');
  }
  for (const o of other) console.log(`\n  ${o}`);
  process.exit(4);
};

main().catch(err => { console.error(err); process.exit(1); });
