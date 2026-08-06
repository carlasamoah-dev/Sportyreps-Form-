/**
 * tidy-manifest.js
 *
 * Collapses a manifest that grew duplicate rows, and reports what is in it.
 *
 * Earlier versions of verify-batch.js appended on every --write, so running a
 * batch twice put two rows in for every slot. The upload then counted each row
 * separately, which is why a 192 object drop reported 358 uploads. Nothing was
 * damaged by that (a second upload of the same bytes to the same path is a
 * no-op) but the ledger stopped being a truthful record, and the ledger is the
 * whole point.
 *
 * One slot of one response is one row. Where duplicates disagree, the row that
 * already has a public URL wins, because that one reflects what is actually in
 * Supabase.
 *
 * Usage:  node migration/scripts/tidy-manifest.js          report only
 *         node migration/scripts/tidy-manifest.js --write  rewrite the file
 */

const fs = require('fs');
const { parseCsv, toCsv } = require('./csv');
const { PATHS } = require('./config');

const write = process.argv.includes('--write');

const main = () => {
  if (!fs.existsSync(PATHS.manifest)) {
    console.log('No manifest.csv yet. Nothing to tidy.');
    return;
  }

  const table = parseCsv(fs.readFileSync(PATHS.manifest, 'utf8'));
  const header = table[0];
  const rows = table.slice(1);
  const col = Object.fromEntries(header.map((h, i) => [h, i]));

  const keep = new Map();
  let duplicates = 0;

  for (const r of rows) {
    const key = `${r[col.response_id]}|${r[col.slot]}`;
    const prior = keep.get(key);
    if (!prior) { keep.set(key, r); continue; }

    duplicates++;
    // Prefer the row that records a real upload over one that only records intent.
    const priorUploaded = Boolean(prior[col.public_url]);
    const thisUploaded = Boolean(r[col.public_url]);
    if (thisUploaded && !priorUploaded) keep.set(key, r);
  }

  const final = [...keep.values()];
  const uploaded = final.filter(r => r[col.public_url]).length;
  const pending = final.filter(r => !r[col.public_url]).length;
  const failures = final.filter(r => !r[col.public_url] && r[col.notes] && /\|/.test(r[col.notes]));
  const players = new Set(final.map(r => r[col.response_id]));

  console.log(`manifest.csv: ${rows.length} rows in, ${final.length} after collapsing ${duplicates} duplicate(s)`);
  console.log(`  ${players.size} players, ${uploaded} files uploaded, ${pending} still to go`);

  if (failures.length) {
    const reasons = new Map();
    for (const r of failures) {
      const msg = r[col.notes].split('|').pop().trim();
      reasons.set(msg, (reasons.get(msg) || 0) + 1);
    }
    console.log('\nStill failing, by reason:');
    for (const [msg, n] of [...reasons.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)} x  ${msg}`);
    }
    console.log('\nFiles affected:');
    for (const r of failures.slice(0, 30)) {
      console.log(`  ${r[col.bucket]}/${r[col.storage_path]}`);
    }
    if (failures.length > 30) console.log(`  ...and ${failures.length - 30} more`);
  }

  if (!write) {
    console.log('\nReport only. Re-run with --write to collapse the duplicates.');
    return;
  }
  fs.writeFileSync(PATHS.manifest, toCsv([header, ...final]));
  console.log(`\nmanifest.csv rewritten with ${final.length} rows.`);
};

main();
