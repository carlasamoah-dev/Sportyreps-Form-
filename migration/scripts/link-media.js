/**
 * link-media.js
 *
 * Joins the two halves of the migration: the answer payloads produced by
 * transform-rows.js and the uploaded file URLs recorded in manifest.csv.
 *
 * The join key is the Typeform response id, and the slot decides which column
 * the URL lands in. Filenames play no part at this stage, so a file that was
 * verified into the wrong slot cannot silently become the wrong column here.
 *
 * With --insert the linked rows are upserted into public.submissions on
 * source_response_id, which makes a re-run idempotent rather than duplicating.
 *
 * Usage:
 *   node migration/scripts/link-media.js [--batch 1]
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node migration/scripts/link-media.js --batch 1 --insert
 */

const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./csv');
const { PATHS, SLOTS } = require('./config');

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
const doInsert = args.includes('--insert');

const SLOT_COLUMN = Object.fromEntries(SLOTS.map(s => [s.slot, s.dbColumn]));

const main = async () => {
  const payloads = JSON.parse(fs.readFileSync(`${PATHS.out}/payloads.json`, 'utf8'));

  // Responses transform-rows deliberately left out. Their media was uploaded,
  // because the upload runs before any of this and does not know about policy,
  // so without this they look identical to a response that failed to transform.
  const excludedPath = `${PATHS.out}/excluded.json`;
  const excluded = fs.existsSync(excludedPath)
    ? JSON.parse(fs.readFileSync(excludedPath, 'utf8'))
    : {};
  const table = parseCsv(fs.readFileSync(PATHS.manifest, 'utf8'));
  const header = table[0];
  const col = Object.fromEntries(header.map((h, i) => [h, i]));

  const media = table.slice(1).filter(r =>
    r[col.status] === 'uploaded' &&
    r[col.public_url] &&
    (batchNo === null || r[col.batch] === String(batchNo)));

  const ready = [];
  const blocked = [];
  const skipped = [];

  const byResponse = new Map();
  for (const r of media) {
    const id = r[col.response_id];
    if (!byResponse.has(id)) byResponse.set(id, []);
    byResponse.get(id).push(r);
  }

  for (const [id, files] of byResponse) {
    const payload = payloads[id];
    if (!payload) {
      // A decision already taken is not a question to be asked again.
      if (excluded[id]) skipped.push({ id, reason: excluded[id] });
      else blocked.push({ id, reason: 'media uploaded but no answer payload (has transform-rows.js been run?)' });
      continue;
    }

    const linked = { ...payload };
    for (const f of files) {
      const column = SLOT_COLUMN[f[col.slot]];
      if (!column) { blocked.push({ id, reason: `unknown slot ${f[col.slot]}` }); continue; }
      linked[column] = f[col.public_url];
    }

    // Every photo slot the live form marks required must have landed somewhere.
    const missing = ['photo-portrait_url', 'photo-front_url', 'photo-rear_url'].filter(c => !linked[c]);
    if (missing.length) { blocked.push({ id, reason: `missing ${missing.join(', ')}` }); continue; }

    ready.push(linked);
  }

  fs.writeFileSync(`${PATHS.out}/payloads-linked.json`, JSON.stringify(ready, null, 2));

  console.log(`linked   ${ready.length} responses`);
  for (const s of skipped) console.log(`  SKIP ${s.id}  ${s.reason}`);
  for (const b of blocked) console.log(`  HOLD ${b.id}  ${b.reason}`);
  if (skipped.length) {
    console.log(`\n${skipped.length} response(s) skipped by policy. Their files are in Storage but they`);
    console.log('will not appear in the database. See "Open policy decisions" in the README.');
  }
  if (!doInsert) {
    console.log('\nNot inserted. Re-run with --insert once the rows above look right.');
    return;
  }
  if (blocked.length) {
    console.log('\nRefusing to insert while rows are on hold.');
    process.exit(2);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).');
    process.exit(1);
  }

  const { createClient } = requireSupabase();
  const supabase = createClient(url, key);

  const { error } = await supabase
    .from('submissions')
    .upsert(ready, { onConflict: 'source_response_id' });

  if (error) {
    console.error(`insert failed: ${error.message}`);
    process.exit(1);
  }
  console.log(`inserted ${ready.length} rows (upsert on source_response_id)`);
};

main().catch(err => { console.error(err); process.exit(1); });
