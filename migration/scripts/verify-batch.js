/**
 * verify-batch.js
 *
 * Checks a dropped batch of files BEFORE anything is uploaded or written to the
 * database. Nothing is trusted: every file has to earn its place in the manifest.
 *
 * Three drop layouts are accepted, in increasing order of safety:
 *
 *   incoming/FILE                        flat. Identity comes from the filename
 *                                        alone, so it cannot be used for the
 *                                        responses whose slots share a filename.
 *   incoming/{response_id}/FILE          the folder names the person. A file
 *                                        called `front.jpeg` names its own slot.
 *   incoming/{response_id}/{slot}/FILE   both stated by the layout. Original
 *                                        filenames can be kept unchanged.
 *
 * Checks performed per file:
 *   1. The file resolves to exactly one (response_id, slot). Layout wins over
 *      filename; a filename that fills two slots is held, never duplicated.
 *      Files arriving with a harness-added prefix are matched on suffix.
 *   2. Magic-byte sniff confirms the bytes match the extension (a .jpg that is
 *      really a PDF is caught here).
 *   3. SHA-256 recorded, so a file dropped twice under different names is seen.
 *   4. Bucket routing resolves, otherwise the file is quarantined.
 *
 * Checks performed per response:
 *   5. No slot claimed by two different files.
 *   6. Slot completeness against the index (4 of 4, or exactly what Typeform held).
 *
 * Nothing is written anywhere except a report and, with --write, manifest rows
 * with status=verified. Quarantined files are listed with the reason.
 *
 * Usage:  node migration/scripts/verify-batch.js --batch 1 [--dir migration/incoming] [--write]
 *
 * --relaxed loosens two rules when the export's own ambiguity would otherwise
 * block a drop: a file whose name matches several slots fills all of them, and a
 * document with no name match is taken as that player's CV. Both are recorded in
 * the report and in the manifest notes, so every relaxed decision stays visible.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseCsv, toCsv } = require('./csv');
const { PATHS, SLOTS, DOC_EXTS, IMAGE_EXTS, bucketForExt, storagePath, EXT_MIME } = require('./config');

const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};
const batchNo = argVal('--batch', '0');
const dir = argVal('--dir', PATHS.incoming);
const write = args.includes('--write');

// Opt-in, because both behaviours trade a guarantee for progress:
//   - one file fills every slot its name matches, instead of being held
//   - a document lands in the CV slot on file type alone, without a name match
// Every relaxed decision is printed and recorded in the manifest notes.
const relaxed = args.includes('--relaxed');

const SLOT_NAMES = SLOTS.map(s => s.slot);

// What a person writes on a file to say which slot it is. 'full' because the
// live form labels the front view with full_view.png, 'potrait' because that
// spelling appears in the source data as often as the correct one.
const SLOT_WORDS = {
  cv: 'cv',
  portrait: 'portrait', potrait: 'portrait',
  front: 'front', full: 'front',
  rear: 'rear',
};

// Longest first, so 'portrait' wins over any shorter word it contains.
const SLOT_WORD_KEYS = Object.keys(SLOT_WORDS).sort((a, b) => b.length - a.length);

// How firmly a slot was established, lowest wins when two files want one slot.
// A person putting a file in a slot folder, or writing the slot on it, outranks
// anything this script inferred on its own.
const STRENGTH = { layout: 0, named: 1, index: 2, relaxed: 3 };

const slotFromName = (stem) => {
  const key = SLOT_WORD_KEYS.find(w => stem === w || stem.endsWith(w) || stem.split('-').pop() === w);
  return key ? SLOT_WORDS[key] : null;
};

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

/**
 * Walk the drop directory, recording for each file whatever the layout already
 * says about it. One level of nesting names the response, an optional second
 * level names the slot. Anything deeper is ignored rather than guessed at.
 */
const collect = (root) => {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;

    if (entry.isFile()) {
      out.push({ rel: entry.name, file: entry.name, responseId: null, slot: null });
      continue;
    }
    if (!entry.isDirectory()) continue;

    const responseId = entry.name;
    for (const sub of fs.readdirSync(path.join(root, responseId), { withFileTypes: true })) {
      if (sub.name.startsWith('.')) continue;

      if (sub.isFile()) {
        out.push({ rel: path.join(responseId, sub.name), file: sub.name, responseId, slot: null });
        continue;
      }
      if (!sub.isDirectory()) continue;

      const slot = sub.name.toLowerCase();
      if (!SLOT_NAMES.includes(slot)) {
        out.push({ rel: path.join(responseId, sub.name), file: sub.name, responseId, slot: null, notASlot: true });
        continue;
      }
      for (const f of fs.readdirSync(path.join(root, responseId, slot), { withFileTypes: true })) {
        if (f.isFile() && !f.name.startsWith('.')) {
          out.push({ rel: path.join(responseId, slot, f.name), file: f.name, responseId, slot });
        }
      }
    }
  }
  return out;
};

/**
 * Decide which index rows a dropped file is. Returns { hits } or { error }, and
 * optionally a note recording any judgement call it had to make.
 *
 * The order matters: a slot stated by the layout is a human assertion and beats
 * the filename, which for 11 of the 50 responses cannot tell two slots apart.
 */
const resolve = (entry, index) => {
  // A folder of player folders, dropped whole. Common enough to be worth naming
  // precisely: the generic message sends people looking for the wrong problem.
  if (entry.notASlot && index.some(e => e.response_id === entry.file)) {
    return { error: `'${entry.responseId}' is a wrapper folder, '${entry.file}' inside it is the player. Copy the player folders themselves into the drop folder, not the folder holding them` };
  }
  if (entry.notASlot) {
    return { error: `'${entry.file}' is neither a file nor one of ${SLOT_NAMES.join('/')}` };
  }

  const rows = entry.responseId
    ? index.filter(e => e.response_id === entry.responseId)
    : index;

  if (entry.responseId && !rows.length) {
    return { error: `folder '${entry.responseId}' is not a response id in file_index.csv` };
  }

  // 1. Slot stated by the layout.
  if (entry.slot) {
    const hit = rows.find(e => e.slot === entry.slot);
    return hit ? { hits: [hit], strength: STRENGTH.layout } : { error: `${entry.responseId} has no ${entry.slot} slot in the index` };
  }

  // 2. Slot stated by the filename itself, with or without a harness prefix
  //    (`front.jpeg`, `c96b7e754eed-front.jpeg`).
  const stem = path.basename(entry.file, path.extname(entry.file)).toLowerCase();
  const named = stem === 'cv' || SLOT_NAMES.includes(stem) || SLOT_NAMES.includes(stem.split('-').pop())
    ? slotFromName(stem)
    : null;
  if (named) {
    if (!entry.responseId) return { error: `'${entry.file}' names a slot but not a response; put it in a folder named after its response id` };
    const hit = rows.find(e => e.slot === named);
    return hit ? { hits: [hit], strength: STRENGTH.named } : { error: `${entry.responseId} has no ${named} slot in the index` };
  }

  // 3. Fall back to the original filename. Exact match first, then suffix match
  //    (upload harnesses prepend an opaque id to the original name).
  let hits = rows.filter(e => e.original_filename === entry.file);
  if (!hits.length) hits = rows.filter(e => entry.file.endsWith(e.original_filename));
  // 3b. No name match. A document in a player's folder is almost certainly that
  //     player's CV, so with --relaxed it is accepted on file type alone, but
  //     only when the export also recorded a document in that CV slot.
  if (!hits.length && relaxed && entry.responseId) {
    const ext = path.extname(entry.file).toLowerCase();
    const cv = rows.find(e => e.slot === 'cv');
    if (DOC_EXTS.includes(ext) && cv && DOC_EXTS.includes(cv.ext)) {
      return { hits: [cv], strength: STRENGTH.relaxed, note: `matched to cv by file type, name does not match '${cv.original_filename}' (--relaxed)` };
    }
  }
  // 3c. The filename is not in the index, but it ends in a slot word: someone
  //     renamed the file to say which slot it is. Trust that, since the folder
  //     already settles who it belongs to.
  if (!hits.length && entry.responseId) {
    const appended = slotFromName(stem);
    const hit = appended && rows.find(e => e.slot === appended);
    if (hit) {
      // Strip the appended word and see whether the export knows the original
      // name. If it does, the two readings must agree. A disagreement is a real
      // question about the data and is put to the operator rather than settled
      // here, either way round.
      const word = SLOT_WORD_KEYS.find(w => stem.endsWith(w));
      const base = stem.slice(0, stem.length - word.length) + path.extname(entry.file);
      const known = rows.filter(e => e.original_filename.toLowerCase() === base.toLowerCase()
        || base.toLowerCase().endsWith(e.original_filename.toLowerCase()));

      if (known.length && !known.some(e => e.slot === appended)) {
        return { error: `the name says ${appended}, but the export records '${known[0].original_filename}' as ${known.map(e => e.slot).join(' and ')}. `
          + `Rename it to '${appended}${path.extname(entry.file)}' to insist on ${appended}, or to '${known[0].slot}${path.extname(entry.file)}' to go with the export` };
      }
      return {
        hits: [hit],
        strength: STRENGTH.named,
        note: known.length ? `slot ${appended} read from the name, agrees with the export` : `slot ${appended} read from the name '${entry.file}', which is not in the index`,
      };
    }
  }
  if (!hits.length) return { error: 'filename not found in file_index.csv' };

  const responseIds = [...new Set(hits.map(h => h.response_id))];
  if (responseIds.length > 1) {
    return { error: `filename spans ${responseIds.length} responses (${responseIds.join(', ')}); put it in a folder named after its response id` };
  }

  // One filename, several slots. The index cannot say whether those slots hold
  // the same picture or two different ones, so the file is held rather than
  // copied into both. Naming it after the slot resolves it.
  if (hits.length > 1) {
    if (relaxed) {
      return { hits, strength: STRENGTH.relaxed, note: `one file filling ${hits.length} slots: ${hits.map(h => h.slot).join(', ')} (--relaxed)` };
    }
    const ext = path.extname(hits[0].original_filename).toLowerCase();
    return { error: `filename fills ${hits.length} slots (${hits.map(h => h.slot).join(', ')}) and cannot say which; rename each copy to <slot>${ext}` };
  }

  return { hits, strength: STRENGTH.index };
};

const main = () => {
  if (!fs.existsSync(PATHS.fileIndex)) {
    console.error('file_index.csv is missing. Run build-index.js first.');
    process.exit(1);
  }
  if (!fs.existsSync(dir)) {
    console.error(`Drop directory not found: ${dir}`);
    process.exit(1);
  }

  const index = parseCsv(fs.readFileSync(PATHS.fileIndex, 'utf8')).slice(1)
    .map(([response_id, slot, original_filename, ext, typeform_hash, expected_bucket]) =>
      ({ response_id, slot, original_filename, ext, typeform_hash, expected_bucket }));

  const dropped = collect(dir);
  if (!dropped.length) {
    console.log(`No files in ${dir}`);
    return;
  }

  let verified = [];
  const quarantined = [];
  const seenHashes = new Map();

  for (const entry of dropped) {
    const full = path.join(dir, entry.rel);

    // 1. Resolve to exactly one (response, slot). This happens before the bytes
    //    are read, because an unexpected directory resolves to a hold and has no
    //    bytes to read.
    const { hits, note, strength, error } = resolve(entry, index);
    if (error && entry.notASlot) {
      quarantined.push({ file: entry.rel, sha: '', reason: error });
      continue;
    }

    const buf = fs.readFileSync(full);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');

    if (error) {
      quarantined.push({ file: entry.rel, sha, reason: error });
      continue;
    }

    // Every hit shares one filename, so one extension covers them all.
    let ext = path.extname(hits[0].original_filename).toLowerCase();
    const sniffed = sniff(buf);
    let extNote = '';

    // 2. Bytes must agree with the extension. A phone that saved a JPEG under a
    //    .png name is harmless once the real type is used for the upload, so
    //    --relaxed keeps it and routes by what the bytes actually are.
    if (!sniffAgrees(sniffed, ext)) {
      const sameFamily = sniffed
        && ((IMAGE_EXTS.includes(sniffed) && IMAGE_EXTS.includes(ext))
          || (DOC_EXTS.includes(sniffed) && DOC_EXTS.includes(ext)));
      if (!relaxed || !sameFamily) {
        quarantined.push({ file: entry.rel, sha, reason: `content is ${sniffed || 'unrecognised'} but extension is ${ext}` });
        continue;
      }
      extNote = `named ${ext} but the bytes are ${sniffed}, stored as ${sniffed} (--relaxed)`;
      ext = sniffed;
    }

    // 3. Same bytes dropped twice under different names. Legitimate when one
    //    response genuinely reused a photo across slots; recorded, not rejected.
    if (seenHashes.has(sha) && seenHashes.get(sha) !== entry.rel) {
      console.log(`note: ${entry.rel} is byte-identical to ${seenHashes.get(sha)}`);
    }
    seenHashes.set(sha, entry.rel);

    // 4. Bucket routing.
    const bucket = bucketForExt(ext);
    if (!bucket) {
      quarantined.push({ file: entry.rel, sha, reason: `no bucket accepts ${ext}` });
      continue;
    }

    // Normally one row. With --relaxed a single file can fill several slots, in
    // which case the same bytes are uploaded once per slot under its own path.
    for (const hit of hits) {
      const reasons = [];
      if (note) reasons.push(note);
      if (extNote) reasons.push(extNote);
      if (hit.slot === 'cv' && !DOC_EXTS.includes(ext)) {
        reasons.push('non-document in CV slot, routed to photos bucket');
      }
      verified.push({
        batch: batchNo,
        response_id: hit.response_id,
        slot: hit.slot,
        original_filename: hit.original_filename,
        local_path: entry.rel,
        sha256: sha,
        bytes: buf.length,
        mime: EXT_MIME[ext] || 'application/octet-stream',
        bucket,
        storage_path: storagePath(hit.response_id, hit.slot, ext),
        status: 'verified',
        strength,
        notes: reasons.join('; '),
      });
    }
  }

  // 5. No slot claimed twice. Whichever file is right, the tool cannot know, so
  //    both are held rather than one silently winning.
  const bySlot = new Map();
  for (const v of verified) {
    const key = `${v.response_id}|${v.slot}`;
    if (!bySlot.has(key)) bySlot.set(key, []);
    bySlot.get(key).push(v);
  }
  const contested = new Set();
  const superseded = new Set();
  for (const [key, rows] of bySlot) {
    if (rows.length < 2) continue;
    if (new Set(rows.map(r => r.local_path)).size === 1) continue;   // same file, several slots

    // Two copies of the same bytes under different names is not a conflict about
    // which file belongs here, only about which copy to send. Keep one.
    if (new Set(rows.map(r => r.sha256)).size === 1) {
      for (const r of rows.slice(1)) superseded.add(r);
      rows[0].notes = [rows[0].notes, `${rows.length} identical copies dropped, one uploaded`].filter(Boolean).join('; ');
      continue;
    }

    // Different files, but not equally entitled to the slot. A file put here by
    // a person outranks one this script inferred, so the weaker claims give way
    // instead of the whole slot being held.
    const best = Math.min(...rows.map(r => r.strength));
    const winners = rows.filter(r => r.strength === best);
    if (winners.length === 1) {
      const losers = rows.filter(r => r !== winners[0]);
      for (const r of losers) superseded.add(r);
      winners[0].notes = [winners[0].notes,
        `kept over ${losers.length} weaker claim(s) to this slot`].filter(Boolean).join('; ');
      continue;
    }
    contested.add(key);
    for (const r of rows) {
      quarantined.push({
        file: r.local_path,
        sha: r.sha256,
        reason: `slot ${r.slot} of ${r.response_id} is claimed by ${rows.length} files (${rows.map(x => x.local_path).join(', ')})`,
      });
    }
  }
  verified = verified.filter(v => !superseded.has(v) && !contested.has(`${v.response_id}|${v.slot}`));

  // 6. Slot completeness per response.
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
    console.log(`  OK   ${v.response_id}  ${v.slot.padEnd(8)} ${v.local_path}  ->  ${v.bucket}/${v.storage_path}${v.notes ? '  [' + v.notes + ']' : ''}`);
  }
  for (const q of quarantined) console.log(`  HOLD ${q.file}  ${q.reason}`);
  for (const i of incomplete) console.log(`  GAP  ${i.id} missing slot(s): ${i.missing.join(', ')}`);

  // Exit 3 rather than 0 when the dry run found something, so a wrapper can tell
  // "checked, all clean" from "checked, needs a human" without parsing the report.
  if (!write) {
    if (quarantined.length || incomplete.length) {
      console.log('\nDry run. Resolve the HOLD/GAP lines above, then run this again.');
      process.exit(3);
    }
    console.log('\nDry run. Re-run with --write to append these rows to manifest.csv.');
    return;
  }
  if (quarantined.length || incomplete.length) {
    console.log('\nRefusing to write: resolve the HOLD/GAP lines above first.');
    process.exit(2);
  }

  const header = ['batch', 'response_id', 'slot', 'original_filename', 'local_path', 'sha256', 'bytes', 'mime', 'bucket', 'storage_path', 'status', 'public_url', 'notes'];
  const existing = fs.existsSync(PATHS.manifest)
    ? parseCsv(fs.readFileSync(PATHS.manifest, 'utf8')).slice(1)
    : [];
  const rows = verified.map(v => [v.batch, v.response_id, v.slot, v.original_filename, v.local_path, v.sha256, v.bytes, v.mime, v.bucket, v.storage_path, v.status, '', v.notes]);
  fs.writeFileSync(PATHS.manifest, toCsv([header, ...existing, ...rows]));
  console.log(`\nmanifest.csv  +${rows.length} rows`);
};

main();
