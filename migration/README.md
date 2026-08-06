# Typeform back-migration (2023 to 2024 responses)

Brings 69 legacy Typeform responses and their 200 uploaded files into the
current Supabase build, one small batch at a time, with a verification gate at
every step.

## Why it is built this way

The single hard problem is matching a media file to the right person and the
right slot. Three facts from the export decide the design:

- File URLs in the export are not public. They need a Typeform API token, which
  is why files are being supplied by hand in batches instead of fetched.
- **Filenames are the only reliable link back to a person.** The CV filename
  contains the player's name in just 12 of 50 cases, and photo filenames in 21
  of 150, so names cannot be read off the files. But the export records the exact
  original filename for every file against its response and slot. Unchanged
  filenames therefore match exactly.
- Filenames are not globally unique, in two different ways. Four filenames appear
  under two different responses. Separately, 11 responses give two of their slots
  the same original filename, and the export cannot say whether those are one
  photo reused or two different photos that happen to share a name: the
  `typeform_hash` column is a URL segment, unique per row by construction, so it
  carries no information about content. Both cases are held for a human decision
  rather than guessed at.

Hence the drop layout: **one folder per response, named after the response id.**
The folder settles who a file belongs to, so filenames no longer have to. For
the 11 responses above the slot has to be stated too, either by a `{slot}/`
subfolder or by naming the file `{slot}.{ext}`.

```
incoming/{response_id}/{original_filename}     slot read off the filename
incoming/{response_id}/{slot}/{any_filename}   slot read off the folder
```

Original filenames are still matched against `file_index.csv`, so leaving them
unchanged remains the safest default and is what catches a file dropped into the
wrong folder. A harness-added prefix such as `c96b7e754eed-IMG_0488.jpeg` matches
on suffix. Flat drops straight into `incoming/` still work for the responses
whose filenames are unambiguous.

Renaming to the canonical `{response_id}/{slot}.{ext}` happens on the way into
Supabase Storage, where the path itself makes a misfiled object visible by eye.

## What is and is not in git

Committed: the scripts, `file_index.csv` (response id, slot, filename, hash),
`manifest.csv` (upload ledger) and the SQL. Nothing here holds contact details
or dates of birth.

Never committed (see `.gitignore`): the raw export, the dropped media, the
generated payloads and the review flags. Twelve of these records belong to
under-18s, and git history is effectively permanent, so personal data stays out
of it and lives in Supabase where it can be deleted on request.

## One-time setup

1. In the Supabase SQL Editor, run `migration/sql/002_storage_buckets.sql` and
   `migration/sql/003_submission_columns.sql`, **separately**. Together they are
   what 001 was, split in two because the editor treats a script as one
   transaction: 001 ends with policy statements that need ownership of
   `storage.objects`, and where a project refuses those, the bucket and column
   changes earlier in the script are rolled back with them while the run still
   looks successful. That is not hypothetical, it cost a 200 file upload 13
   failures and would have taken the database write down at the last step.
   `run-batch.js` now asks Supabase whether it is ready before it sends
   anything, so this cannot go unnoticed again.
2. `cd backend && npm install` (the migration scripts reuse the backend's
   `@supabase/supabase-js`).
3. Put the raw export at `migration/source/responses.csv`, or point
   `SOURCE_CSV` at it.
4. `node migration/scripts/build-index.js --check` to confirm the export on this
   machine is the one the column map was built against. The transform reads
   columns by position, because Typeform repeats header labels, so a re-export
   with a different layout would import real-looking values into the wrong
   fields. `run-batch.js` runs this check before it uploads anything.
5. `node migration/scripts/build-index.js` to regenerate `file_index.csv` and
   `batches.md`. Without the export, `--from-index` rebuilds `batches.md` alone
   from the committed index.

## The batch loop

Everything below runs on the machine that holds the media. The files go straight
from that disk to Supabase; nothing about this migration works remotely, because
nothing else can see the files.

The batch number is only a label on the manifest and a filter for the upload and
insert. Every script processes whatever folders it actually finds, so all 50
responses can go in a single pass and usually should: batching by five was a
consequence of flat drops, where small groups were the only way to keep
filenames untangled, and response id folders removed that constraint. Keep the
batches only if you want smaller reports to read.

One command does a whole drop, stopping at each gate:

```bash
node migration/run-batch.js 1

node migration/run-batch.js 1 --dry          # rehearse, change nothing
node migration/run-batch.js 1 --media-only   # upload the files, skip the rows
```

It refuses to go past a HOLD, asks before uploading and again before writing to
the database, and is safe to re-run: an interrupted batch resumes where it
stopped. Credentials come from the environment, then `backend/.env`, and are
only prompted for as a last resort.

The individual steps below are what it runs, and are still the way to drive a
batch by hand:

```bash
# 1. drop the batch's files into migration/incoming/{response_id}/

# 2. verify before anything moves
node migration/scripts/verify-batch.js --batch 1

# 3. once the report is clean, record it
node migration/scripts/verify-batch.js --batch 1 --write

# 4. upload to Supabase Storage
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  node migration/scripts/upload-batch.js --batch 1

# 5. build the answer payloads (whole export at once, cheap to re-run)
node migration/scripts/transform-rows.js

# 6. join answers to media and review
node migration/scripts/link-media.js --batch 1

# 7. when it looks right, write to the database
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  node migration/scripts/link-media.js --batch 1 --insert

# 8. commit manifest.csv so the next session knows where the batch got to
```

Steps 2, 6 and 7 refuse to proceed while anything is on hold. A batch is
resumable: `upload-batch.js` skips rows that already have a public URL, and the
insert upserts on `source_response_id`.

## Open policy decisions

These are set in `scripts/config.js` under `POLICY` and are deliberately
conservative. Change them there, not in the transform code.

- `excludeMinors: true`. Twelve records are under 18 at submission, including a
  12 and a 13 year old who submitted as talents. The live form ends the journey
  for under-18s, so importing them would contradict the product's own gate.
  Flip the flag to import them anyway.
- Height, speed, education and position all carry unresolvable ambiguity in the
  source. The transform maps what it safely can, nulls the rest, and records
  every decision in `review_flags.csv` rather than inventing a value.
- Four names appear more than once across the 50 responses. They are imported as
  separate rows, since two submissions from one person is a fact about the data,
  not a bug to hide. Deduplicate in the admin panel if you want one record each.
