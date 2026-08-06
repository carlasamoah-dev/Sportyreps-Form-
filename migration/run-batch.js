/**
 * run-batch.js
 *
 * One command per batch. Runs the whole sequence in order, shows you what it
 * found at each gate, and stops the moment anything is unclear.
 *
 *   node migration/run-batch.js 1
 *
 * Written in Node rather than as a shell script so it behaves the same on
 * Windows, macOS and Linux. Node is already needed for the migration itself,
 * so this adds nothing to install.
 *
 * Credentials are looked for in the environment first, then in backend/.env,
 * and only then asked for. They are held in memory for the run and never
 * written to disk.
 *
 * Options:
 *   --dir <path>   where the dropped folders are (default migration/incoming)
 *   --dry          rehearse everything, upload nothing, write nothing
 *   --media-only   stop after the files are uploaded, skip the database rows
 *   --relaxed      let one file fill every slot its name matches, and take a
 *                  document as the CV when no filename matches
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { PATHS } = require('./scripts/config');

const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};
const positional = args.find(a => /^\d+$/.test(a));
const batch = argVal('--batch', positional);
const dir = argVal('--dir', PATHS.incoming);
const dry = args.includes('--dry');
const mediaOnly = args.includes('--media-only');
// Passed straight through to the checker. See verify-batch.js for what it loosens.
const relaxed = args.includes('--relaxed');
const verifyArgs = relaxed ? ['--relaxed'] : [];

const SCRIPTS = path.join(__dirname, 'scripts');
const ENV_FILE = path.join(__dirname, '..', 'backend', '.env');

const say = (msg = '') => console.log(msg);
const rule = () => say('─'.repeat(72));
const banner = (text) => { say(''); rule(); say(text); rule(); };
const stop = (msg) => { say(`\n${msg}\n`); process.exit(1); };

const ask = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
});

// Same as ask, but the typed characters are not echoed. Used for the service
// role key, which is powerful enough that it should not be left on screen.
const askSecret = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  let muted = false;
  rl._writeToOutput = (s) => { if (!muted) rl.output.write(s); };
  rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer.trim()); });
  muted = true;
});

const confirm = async (question) => {
  const answer = (await ask(`${question} [y/N] `)).toLowerCase();
  return answer === 'y' || answer === 'yes';
};

// Run one of the migration scripts, inheriting the terminal so its report is
// printed live. Returns its exit code.
const run = (script, scriptArgs, env = {}) => {
  const result = spawnSync(process.execPath, [path.join(SCRIPTS, script), ...scriptArgs], {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  return result.status === null ? 1 : result.status;
};

// backend/.env is gitignored and is where the project already keeps these.
const readEnvFile = () => {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
};

const getCredentials = async () => {
  const fromFile = readEnvFile();
  let url = process.env.SUPABASE_URL || fromFile.SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || fromFile.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY || fromFile.SUPABASE_ANON_KEY;

  if (url && !/^https:\/\/.+\.supabase\.co/.test(url)) {
    say(`  note: SUPABASE_URL does not look like a Supabase project URL (${url})`);
  }
  if (!url) {
    say('\nSupabase project URL. Find it in Supabase under Settings then API.');
    url = await ask('  SUPABASE_URL: ');
  }
  if (!key && anon) {
    say('\nOnly an anon key was found. It is not allowed to write the database rows,');
    say('so the run would fail at the last step. Use the service role key instead.');
    say('Supabase, Settings, API, "service_role". Treat it like a password.');
  }
  if (!key) {
    key = await askSecret('  SUPABASE_SERVICE_ROLE_KEY (input hidden): ');
  }
  if (!url || !key) stop('Cannot continue without a project URL and a key.');
  return { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key };
};

const preflight = () => {
  if (!batch) {
    stop('Which batch? Try:  node migration/run-batch.js 1');
  }
  if (!fs.existsSync(PATHS.fileIndex)) {
    stop('file_index.csv is missing. This should be in the repo; try git pull.');
  }
  if (!fs.existsSync(dir)) {
    stop(`No drop folder at ${dir}\nCreate it and copy this batch's player folders into it.`);
  }
  const dropped = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  if (!dropped.length) {
    stop(`${dir} is empty.\nCopy this batch's player folders into it, then run this again.`);
  }
  try {
    require.resolve(path.join(__dirname, '..', 'backend', 'node_modules', '@supabase', 'supabase-js'));
  } catch (_) {
    try {
      require.resolve('@supabase/supabase-js');
    } catch (__) {
      stop('The Supabase library is not installed yet. Run this once:\n\n  cd backend && npm install && cd ..');
    }
  }
  return dropped.length;
};

const main = async () => {
  const folders = preflight();

  say(`\nBatch ${batch}${dry ? '  (rehearsal, nothing will be uploaded or saved)' : ''}`);
  say(`Reading from ${dir}  (${folders} item${folders === 1 ? '' : 's'})`);

  // The export is checked before anything is uploaded rather than at step 3, so
  // a mismatched spreadsheet is caught while it still costs nothing.
  if (fs.existsSync(PATHS.sourceCsv) && run('build-index.js', ['--check']) === 4) {
    stop('Stopping before anything is uploaded. See above.');
  }

  // ── 1. Check the files ──────────────────────────────────────────────────────
  banner('STEP 1 of 4  Checking the files. Nothing is uploaded yet.');
  const checked = run('verify-batch.js', ['--batch', batch, '--dir', dir, ...verifyArgs]);
  if (checked === 3) {
    stop([
      'Some files are not sorted out yet. In the report above:',
      '',
      '  HOLD  this file needs fixing. The reason says exactly how.',
      '  GAP   a photo or CV for that player has not arrived.',
      '',
      'Fix those, then run this same command again.',
      'Nothing has been uploaded and nothing has been changed.',
    ].join('\n'));
  }
  if (checked !== 0) {
    stop('The check failed to run. Nothing has been changed.');
  }

  say('\nEvery file matched a player and a slot. Check the list above reads right,');
  say('particularly that the front and rear photos are the way round you expect.');
  if (!await confirm('\nGo ahead?')) {
    stop('Stopped. Nothing has been changed.');
  }

  if (dry) {
    say('\nRehearsal only, so stopping here. Re-run without --dry to do it for real.');
    return;
  }

  // Recording the check is what makes the batch resumable, so it happens before
  // anything leaves the machine.
  if (run('verify-batch.js', ['--batch', batch, '--dir', dir, '--write', ...verifyArgs]) !== 0) {
    stop('Refused to record the batch because something is still on hold above.\nFix those files and run this command again. Nothing has been uploaded.');
  }

  // ── 2. Upload the files ─────────────────────────────────────────────────────
  const creds = await getCredentials();

  banner('STEP 2 of 4  Uploading the files to Supabase Storage.');
  if (run('upload-batch.js', ['--batch', batch, '--dir', dir], creds) !== 0) {
    stop('Some files did not upload. Run the same command again; it skips whatever\nalready went up and retries the rest.');
  }

  if (mediaOnly) {
    say('\nFiles are up. Stopping before the database rows, as asked.');
    return;
  }

  // ── 3. Build the text records ───────────────────────────────────────────────
  banner('STEP 3 of 4  Building the text records from the Typeform export.');
  if (!fs.existsSync(PATHS.sourceCsv)) {
    say(`The export spreadsheet is not at ${PATHS.sourceCsv}`);
    say('\nThe photos and CVs for this batch are safely uploaded. The player details');
    say('cannot be written without the export. Put it at the path above, or set');
    say('SOURCE_CSV to point at it, then run this command again. It will skip');
    say('straight past the upload, which is already done.');
    return;
  }
  if (run('transform-rows.js', []) !== 0) {
    stop('Could not build the text records. The uploaded files are unaffected.');
  }

  // ── 4. Join them and write the rows ─────────────────────────────────────────
  banner('STEP 4 of 4  Matching files to players, then saving.');
  if (run('link-media.js', ['--batch', batch], creds) !== 0) {
    stop('Could not match the files to the player records. Nothing has been saved.');
  }

  say('\nAnything marked HOLD above will not be saved until it is resolved.');
  if (!await confirm('\nSave these players to the database?')) {
    stop('Stopped before saving. The files are uploaded; nothing was written to the\ndatabase. Run this command again when you are ready.');
  }

  if (run('link-media.js', ['--batch', batch, '--insert'], creds) !== 0) {
    stop('The save failed. The files are uploaded and the check is recorded, so\nrunning this command again will resume from here.');
  }

  say('');
  rule();
  say(`Batch ${batch} is done.`);
  say('');
  say('Last thing: save the record of what went where, so the next batch knows');
  say('where this one got to.');
  say('');
  say('  git add migration/manifest.csv');
  say(`  git commit -m "Migrate batch ${batch}"`);
  say('');
};

main().catch((err) => { console.error(err); process.exit(1); });
