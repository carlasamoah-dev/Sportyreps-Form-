/**
 * prune-excluded.js
 *
 * Removes from Storage the files belonging to responses the migration decided
 * not to import.
 *
 * The pipeline uploads before it transforms, so it does not yet know which
 * responses policy will exclude. That leaves the photographs and CVs of eleven
 * under-18s, one of them twelve years old, sitting in public buckets attached to
 * no record, serving no purpose and belonging to nobody the product will ever
 * show. Keeping personal data that nothing uses is the kind of thing the rest of
 * this migration was built to avoid, so it should not be the one place that does
 * it by accident.
 *
 * Reads migration/out/excluded.json, which transform-rows.js writes, so it can
 * only ever act on responses that were deliberately left out.
 *
 * Usage:
 *   node migration/scripts/prune-excluded.js                     report only
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node migration/scripts/prune-excluded.js --delete          actually remove
 */

const fs = require('fs');
const path = require('path');
const { parseCsv, toCsv } = require('./csv');
const { PATHS } = require('./config');

const requireSupabase = () => {
  try {
    return require(path.join(__dirname, '..', '..', 'backend', 'node_modules', '@supabase', 'supabase-js'));
  } catch (_) {
    return require('@supabase/supabase-js');
  }
};

const doDelete = process.argv.includes('--delete');

const main = async () => {
  const excludedPath = `${PATHS.out}/excluded.json`;
  if (!fs.existsSync(excludedPath)) {
    console.log(`No ${excludedPath}. Run transform-rows.js first.`);
    process.exit(1);
  }
  if (!fs.existsSync(PATHS.manifest)) {
    console.log('No manifest.csv, so nothing is known to be uploaded.');
    return;
  }

  const excluded = JSON.parse(fs.readFileSync(excludedPath, 'utf8'));
  const table = parseCsv(fs.readFileSync(PATHS.manifest, 'utf8'));
  const header = table[0];
  const rows = table.slice(1);
  const col = Object.fromEntries(header.map((h, i) => [h, i]));

  const targets = rows.filter(r => excluded[r[col.response_id]] && r[col.public_url]);

  if (!targets.length) {
    console.log('Nothing to remove: no uploaded file belongs to an excluded response.');
    return;
  }

  const byResponse = new Map();
  for (const r of targets) {
    const id = r[col.response_id];
    if (!byResponse.has(id)) byResponse.set(id, []);
    byResponse.get(id).push(r);
  }

  console.log(`${targets.length} file(s) across ${byResponse.size} excluded response(s):\n`);
  for (const [id, files] of byResponse) {
    console.log(`  ${id}  ${excluded[id]}`);
    for (const f of files) console.log(`      ${f[col.bucket]}/${f[col.storage_path]}`);
  }

  if (!doDelete) {
    console.log('\nReport only. Nothing has been removed.');
    console.log('To remove them:');
    console.log('  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\');
    console.log('    node migration/scripts/prune-excluded.js --delete');
    console.log('\nThis cannot be undone from here, but the originals are still on this machine,');
    console.log('so a batch can be re-uploaded if policy changes.');
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('\nDeleting needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
    process.exit(1);
  }

  const { createClient } = requireSupabase();
  const supabase = createClient(url, key);

  // Group by bucket: remove() takes a list of paths within one bucket.
  const byBucket = new Map();
  for (const r of targets) {
    const b = r[col.bucket];
    if (!byBucket.has(b)) byBucket.set(b, []);
    byBucket.get(b).push(r);
  }

  let removed = 0;
  let failed = 0;

  for (const [bucket, files] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(files.map(f => f[col.storage_path]));
    if (error) {
      console.log(`  FAIL ${bucket}  ${error.message}`);
      failed += files.length;
      continue;
    }
    for (const f of files) {
      f[col.status] = 'removed';
      f[col.public_url] = '';
      f[col.notes] = [f[col.notes], `removed from storage: ${excluded[f[col.response_id]]}`].filter(Boolean).join('; ');
      removed++;
    }
    console.log(`  OK   ${bucket}  ${files.length} file(s) removed`);
  }

  fs.writeFileSync(PATHS.manifest, toCsv([header, ...rows]));
  console.log(`\nremoved ${removed}, failed ${failed}. manifest.csv updated.`);
  if (failed) process.exit(2);
};

main().catch(err => { console.error(err); process.exit(1); });
