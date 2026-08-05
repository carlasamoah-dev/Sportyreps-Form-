/**
 * upload-batch.js
 *
 * Uploads the files a batch has already verified into Supabase Storage under
 * their canonical paths, then writes the resulting public URL back into
 * manifest.csv.
 *
 * Only rows with status=verified and an empty public_url are touched, so the
 * script is safe to re-run: an interrupted batch resumes where it stopped.
 *
 * Credentials are read from the environment and never written to disk:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (preferred)  or  SUPABASE_ANON_KEY
 *
 * Usage:
 *   cd backend && npm install          # once, for @supabase/supabase-js
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node migration/scripts/upload-batch.js --batch 1 [--dir migration/incoming] [--dry]
 */

const fs = require('fs');
const path = require('path');
const { parseCsv, toCsv } = require('./csv');
const { PATHS } = require('./config');

// Reuse the backend's copy of the SDK rather than installing a second one.
const requireSupabase = () => {
  try {
    return require(path.join(__dirname, '..', '..', 'backend', 'node_modules', '@supabase', 'supabase-js'));
  } catch (_) {
    return require('@supabase/supabase-js');
  }
};

const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};
const batchNo = argVal('--batch', null);
const dir = argVal('--dir', PATHS.incoming);
const dry = args.includes('--dry');

/**
 * Where the bytes for a manifest row live on disk.
 *
 * local_path is written by verify-batch.js and is exact, including any folder
 * the file was dropped in. The filename fallbacks below only exist for manifests
 * written before that column, and cannot distinguish two slots that share a
 * filename, so they are last resort.
 */
const resolveSource = (r, col) => {
  if (col.local_path !== undefined && r[col.local_path]) {
    const exact = path.join(dir, r[col.local_path]);
    if (fs.existsSync(exact)) return exact;
  }
  const flat = path.join(dir, r[col.original_filename]);
  if (fs.existsSync(flat)) return flat;
  return fs.readdirSync(dir).map(f => path.join(dir, f))
    .find(f => fs.statSync(f).isFile() && path.basename(f).endsWith(r[col.original_filename])) || null;
};

const main = async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!dry && (!url || !key)) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in the environment.');
    process.exit(1);
  }

  const table = parseCsv(fs.readFileSync(PATHS.manifest, 'utf8'));
  const header = table[0];
  const rows = table.slice(1);
  const col = Object.fromEntries(header.map((h, i) => [h, i]));

  const todo = rows.filter(r =>
    r[col.status] === 'verified' &&
    !r[col.public_url] &&
    (batchNo === null || r[col.batch] === String(batchNo)));

  if (!todo.length) {
    console.log('Nothing to upload. Every verified row already has a public URL.');
    return;
  }
  console.log(`${todo.length} objects to upload${batchNo !== null ? ` for batch ${batchNo}` : ''}.`);

  if (dry) {
    for (const r of todo) console.log(`  would upload ${r[col.original_filename]} -> ${r[col.bucket]}/${r[col.storage_path]}`);
    return;
  }

  const { createClient } = requireSupabase();
  const supabase = createClient(url, key);

  let done = 0;
  let failed = 0;

  for (const r of todo) {
    const source = resolveSource(r, col);

    if (!source) {
      console.log(`  MISS ${r[col.local_path] || r[col.original_filename]} not present in ${dir}`);
      failed++;
      continue;
    }

    const bytes = new Uint8Array(fs.readFileSync(source));
    const { error } = await supabase.storage
      .from(r[col.bucket])
      .upload(r[col.storage_path], bytes, { contentType: r[col.mime], upsert: false });

    if (error && !/exists/i.test(error.message)) {
      console.log(`  FAIL ${r[col.storage_path]}  ${error.message}`);
      r[col.notes] = [r[col.notes], error.message].filter(Boolean).join(' | ');
      failed++;
      continue;
    }

    const { data } = supabase.storage.from(r[col.bucket]).getPublicUrl(r[col.storage_path]);
    r[col.public_url] = data.publicUrl;
    r[col.status] = 'uploaded';
    done++;
    console.log(`  OK   ${r[col.response_id]} ${r[col.slot]} -> ${r[col.storage_path]}`);
  }

  fs.writeFileSync(PATHS.manifest, toCsv([header, ...rows]));
  console.log(`\nuploaded ${done}, failed ${failed}. manifest.csv updated.`);
  if (failed) process.exit(2);
};

main().catch(err => { console.error(err); process.exit(1); });
