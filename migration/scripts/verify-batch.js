/**
 * verify-batch.js
 *
 * Checks a dropped batch of files BEFORE anything is uploaded or written to the
 * database. Nothing is trusted: every file has to earn its place in the manifest.
 *
 * Checks performed per file:
 *   1. Filename resolves to exactly one (response_id, slot) in file_index.csv.
 *      Files arriving with a harness-added hash prefix are matched on suffix.
 *   2. Magic-byte sniff confirms the bytes match the extension (a .jpg that is
 *      really a PDF is caught here).
 *   3. SHA-256 recorded, so a file dropped twice under different names is seen.
 *   4. Bucket routing resolves, otherwise the file is quarantined.
 *
 * Checks performed per response:
 *   5. Slot completeness against the index (4 of 4, or exactly what Typeform held).
 *
 * Nothing is written anywhere except a report and, with --write, manifest rows
 * with status=verified. Quarantined files are listed with the reason.
 *
 * Usage:  node migration/scripts/verify-batch.js --batch 1 [--dir migration/incoming] [--write]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseCsv, toCsv } = require('./csv');
const { PATHS, bucketForExt, storagePath, EXT_MIME } = require('./config');

const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};
const batchNo = argVal('--batch', '0');
const dir = argVal('--dir', PATHS.incoming);
const write = args.includes('--write');

// Magic bytes for the formats present in this export.
const sniff = (buf) => {
  const hex = buf.subarray(0, 12).toString('hex');
  if (hex.startsWith('25504446')) return '.pdf';
  if (hex.startsWith('ffd8ff')) return '.jpg';
  if (hex.startsWith('89504e47')) return '.png';
  if (hex.startsWith('47494638')) return '.gif';
  if (buf.subarray(0, 4).toString('hex') === '52494646' && buf.subarray(8, 12).toString() === 'WEBP') return '.webp';
  if (buf.subarray(4, 8).toString() === 'ftyp') {
    const brand = buf.subarray(8, 12).toString();
    return brand.startsWith('hei') || brand.startsWith('mif') ? '.heic' : '.mov';
  }
  if (hex.startsWith('504b0304')) return '.docx';   // also .pptx, both are zip containers
  if (hex.startsWith('d0cf11e0')) return '.doc';    // legacy OLE compound file
  return null;
};

const EQUIVALENT = { '.jpg': ['.jpg', '.jpeg'], '.jpeg': ['.jpg', '.jpeg'], '.docx': ['.docx', '.pptx'], '.doc': ['.doc'] };
const sniffAgrees = (sniffed, ext) => {
  if (!sniffed) return false;
  const ok = EQUIVALENT[sniffed] || [sniffed];
  return ok.includes(ext);
};

const main = () => {
  if (!fs.existsSync(PATHS.fileIndex)) {
    console.error('file_index.csv is missing. Run build-index.js first.');
    process.exit(1);
  }

  const index = parseCsv(fs.readFileSync(PATHS.fileIndex, 'utf8')).slice(1)
    .map(([response_id, slot, original_filename, ext, typeform_hash, expected_bucket]) =>
      ({ response_id, slot, original_filename, ext, typeform_hash, expected_bucket }));

  const dropped = fs.readdirSync(dir).filter(f => !f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile());
  if (!dropped.length) {
    console.log(`No files in ${dir}`);
    return;
  }

  const verified = [];
  const quarantined = [];
  const seenHashes = new Map();

  for (const file of dropped) {
    const full = path.join(dir, file);
    const buf = fs.readFileSync(full);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');

    // 1. Resolve the file against the index. Exact match first, then suffix match
    //    (upload harnesses prepend an opaque id to the original name).
    let hits = index.filter(e => e.original_filename === file);
    if (!hits.length) hits = index.filter(e => file.endsWith(e.original_filename));
    if (!hits.length) {
      quarantined.push({ file, sha, reason: 'filename not found in file_index.csv' });
      continue;
    }

    // A filename used by one response in several slots is not ambiguous about
    // WHO it belongs to, only about which slots it fills. Both slots get a copy.
    const responseIds = [...new Set(hits.map(h => h.response_id))];
    if (responseIds.length > 1) {
      quarantined.push({ file, sha, reason: `filename spans ${responseIds.length} responses (${responseIds.join(', ')}), needs manual assignment` });
      continue;
    }

    const ext = path.extname(hits[0].original_filename).toLowerCase();
    const sniffed = sniff(buf);

    // 2. Bytes must agree with the extension.
    if (!sniffAgrees(sniffed, ext)) {
      quarantined.push({ file, sha, reason: `content is ${sniffed || 'unrecognised'} but extension is ${ext}` });
      continue;
    }

    // 3. Same bytes dropped twice under different names.
    if (seenHashes.has(sha) && seenHashes.get(sha) !== file) {
      // Legitimate when one response reused a photo across slots; recorded, not rejected.
      console.log(`note: ${file} is byte-identical to ${seenHashes.get(sha)}`);
    }
    seenHashes.set(sha, file);

    // 4. Bucket routing.
    const bucket = bucketForExt(ext);
    if (!bucket) {
      quarantined.push({ file, sha, reason: `no bucket accepts ${ext}` });
      continue;
    }

    for (const hit of hits) {
      verified.push({
        batch: batchNo,
        response_id: hit.response_id,
        slot: hit.slot,
        original_filename: hit.original_filename,
        local_file: file,
        sha256: sha,
        bytes: buf.length,
        mime: EXT_MIME[ext] || 'application/octet-stream',
        bucket,
        storage_path: storagePath(hit.response_id, hit.slot, ext),
        status: 'verified',
        notes: hit.slot === 'cv' && !['.pdf', '.doc', '.docx', '.pptx'].includes(ext)
          ? 'non-document in CV slot, routed to photos bucket'
          : '',
      });
    }
  }

  // 5. Slot completeness per response.
  const touched = [...new Set(verified.map(v => v.response_id))];
  const incomplete = [];
  for (const id of touched) {
    const expected = index.filter(e => e.response_id === id).map(e => e.slot).sort();
    const got = verified.filter(v => v.response_id === id).map(v => v.slot).sort();
    const missing = expected.filter(s => !got.includes(s));
    if (missing.length) incomplete.push({ id, missing });
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log(`\nBatch ${batchNo}: ${dropped.length} files dropped, ${verified.length} slot assignments verified, ${quarantined.length} quarantined\n`);
  for (const v of verified) {
    console.log(`  OK   ${v.response_id}  ${v.slot.padEnd(8)} ${v.local_file}  ->  ${v.bucket}/${v.storage_path}${v.notes ? '  [' + v.notes + ']' : ''}`);
  }
  for (const q of quarantined) console.log(`  HOLD ${q.file}  ${q.reason}`);
  for (const i of incomplete) console.log(`  GAP  ${i.id} missing slot(s): ${i.missing.join(', ')}`);

  if (!write) {
    console.log('\nDry run. Re-run with --write to append these rows to manifest.csv.');
    return;
  }
  if (quarantined.length || incomplete.length) {
    console.log('\nRefusing to write: resolve the HOLD/GAP lines above first.');
    process.exit(2);
  }

  const header = ['batch', 'response_id', 'slot', 'original_filename', 'sha256', 'bytes', 'mime', 'bucket', 'storage_path', 'status', 'public_url', 'notes'];
  const existing = fs.existsSync(PATHS.manifest)
    ? parseCsv(fs.readFileSync(PATHS.manifest, 'utf8')).slice(1)
    : [];
  const rows = verified.map(v => [v.batch, v.response_id, v.slot, v.original_filename, v.sha256, v.bytes, v.mime, v.bucket, v.storage_path, v.status, '', v.notes]);
  fs.writeFileSync(PATHS.manifest, toCsv([header, ...existing, ...rows]));
  console.log(`\nmanifest.csv  +${rows.length} rows`);
};

main();
