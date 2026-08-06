/**
 * transform-rows.js
 *
 * Turns Typeform answer rows into payloads shaped exactly like the ones the
 * live backend inserts into public.submissions, and records every judgement
 * call it had to make in review_flags.csv.
 *
 * The rule throughout: never invent a value. Anything that cannot be mapped
 * cleanly becomes null plus a flag, so the gap is visible in review instead of
 * hidden behind a plausible-looking number.
 *
 * Output (both gitignored, they contain personal data):
 *   migration/out/payloads.json     one object per response, keyed by response id
 *   migration/out/excluded.json     response id -> why it was left out
 *   migration/review_flags.csv      response_id, field, issue, raw value
 *
 * Usage:  SOURCE_CSV=/path/to/responses.csv node migration/scripts/transform-rows.js
 */

const fs = require('fs');
const { parseCsv, toCsv } = require('./csv');
const { PATHS, COL, POLICY, FOOT_MAP, EDUCATION_MAP, POSITION_MAP } = require('./config');

const flags = [];
const flag = (id, field, issue, raw) => flags.push([id, field, issue, raw]);

const clean = (v) => (v === undefined || v === null ? '' : String(v).trim());

// Typeform writes 1/0 for yes/no; the live schema stores "Yes"/"No".
const yesNo = (v) => {
  const s = clean(v);
  if (s === '1') return 'Yes';
  if (s === '0') return 'No';
  return null;
};

// Excel prefixes phone numbers with an apostrophe to stop them being reformatted.
const phone = (v) => clean(v).replace(/^'+/, '') || null;

const isoDate = (v) => {
  const s = clean(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const intOrNull = (v) => {
  const s = clean(v);
  if (!/^\d+$/.test(s)) return null;
  return parseInt(s, 10);
};

/**
 * Height arrives as feet-and-inches with no separator ("58" = 5'8"), as bare
 * feet ("5"), or as centimetres ("170"). Anything ambiguous is flagged rather
 * than guessed.
 */
const height = (id, raw) => {
  const s = clean(raw);
  if (!s) return null;
  const n = parseInt(s.replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) { flag(id, 'height', 'unparseable', s); return null; }

  // Three digits where the first is a plausible foot count and the last two are
  // a plausible inch count, e.g. 511 -> 5'11". Checked before centimetres so
  // 511 is not mistaken for a height of 5.11 metres.
  if (n >= 300 && n <= 711 && n % 100 <= 11) {
    return `${Math.floor(n / 100)}'${n % 100}"`;
  }

  if (n >= 120 && n <= 220) {                       // centimetres
    const totalIn = n / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn % 12);
    flag(id, 'height', 'converted from cm', s);
    return `${ft}'${inch}"`;
  }
  if (n >= 30 && n <= 79) {                         // feet and inches, e.g. 58 -> 5'8"
    const ft = Math.floor(n / 10);
    const inch = n % 10;
    if (ft < 3 || ft > 7 || inch > 11) { flag(id, 'height', 'out of plausible range', s); return null; }
    return `${ft}'${inch}"`;
  }
  if (n >= 3 && n <= 7) { flag(id, 'height', 'feet only, inches unknown', s); return `${n}'0"`; }

  flag(id, 'height', 'out of plausible range', s);
  return null;
};

/**
 * Speed was a free-text question. Only a bare number is usable; "N/A", "20mph",
 * "100/70" and prose all become null plus a flag.
 */
const speed = (id, raw) => {
  const s = clean(raw);
  if (!s || /^n\/?a$/i.test(s)) return null;
  const m = s.match(/^(\d{1,2})(\s*mph)?$/i);
  if (!m) { flag(id, 'speed', 'not a usable number', s); return null; }
  const n = parseInt(m[1], 10);
  if (n < 1 || n > 30) { flag(id, 'speed', 'outside the range the live form allows', s); return null; }
  return n;
};

// Collapse a run of Typeform checkbox columns into the single text field the
// live schema uses. Blank cell means unticked.
const collapse = (row, from, to, header) => {
  const picked = [];
  for (let i = from; i <= to; i++) if (clean(row[i])) picked.push(clean(row[i]) === '1' ? header[i] : clean(row[i]));
  return picked;
};

const ageAt = (dobRaw, submitRaw) => {
  const dob = new Date(clean(dobRaw));
  const sub = new Date(clean(submitRaw).replace(' ', 'T') + 'Z');
  if (Number.isNaN(dob.getTime()) || Number.isNaN(sub.getTime())) return null;
  let a = sub.getUTCFullYear() - dob.getUTCFullYear();
  const m = sub.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && sub.getUTCDate() < dob.getUTCDate())) a--;
  return a;
};

const main = () => {
  const rows = parseCsv(fs.readFileSync(PATHS.sourceCsv, 'utf8'));
  const header = rows[0];
  const data = rows.slice(1);

  const payloads = {};
  const skipped = [];
  const minors = [];

  for (const r of data) {
    const id = r[COL.responseId];
    const isRep = clean(r[COL.role]) === 'Representative';

    // Responses that ended at the minor gate carry no answers at all.
    if (!clean(r[COL.cv]) && !clean(r[COL.portrait]) && !clean(r[COL.sex])) {
      skipped.push({ id, reason: 'ended at minor gate, no answers recorded' });
      continue;
    }

    const trueAge = ageAt(r[COL.dob], r[COL.submitDate]);
    if (trueAge !== null && trueAge < 0) flag(id, 'dob', 'date of birth is after the submission date', clean(r[COL.dob]));

    const isMinor = trueAge !== null && trueAge >= 0 && trueAge < POLICY.minorAgeThreshold;
    if (isMinor) {
      flag(id, 'age', `under ${POLICY.minorAgeThreshold} at submission`, String(trueAge));
      if (POLICY.excludeMinors) {
        skipped.push({ id, reason: `under ${POLICY.minorAgeThreshold} at submission (age ${trueAge})` });
        continue;
      }
    }

    // Whether anyone other than the player is named on the record. For an
    // under-18 this is the difference between a guardian-completed submission
    // and a child's unaccompanied one, and it cannot be inferred later: the
    // form does not ask the question directly, it just has these fields.
    const guardianFields = [
      r[COL.repFirst], r[COL.repLast], r[COL.repPhone], r[COL.repEmail], r[COL.repCompany],
      r[COL.viaRepFirst], r[COL.viaRepLast], r[COL.viaRepPhone], r[COL.viaRepEmail], r[COL.viaRepCompany],
    ];
    const guardianOnRecord = guardianFields.some(v => clean(v) !== '');

    if (isMinor) {
      minors.push({ id, age: trueAge, guardian: guardianOnRecord });
      if (!guardianOnRecord) {
        flag(id, 'guardian', 'under 18 with no representative or guardian named on the record', '');
      }
    }

    const statedAge = intOrNull(r[COL.age]);
    if (statedAge !== null && trueAge !== null && Math.abs(statedAge - trueAge) > 1) {
      flag(id, 'age', 'self-reported age disagrees with date of birth', `${statedAge} vs ${trueAge}`);
    }

    // Position was multi-select in Typeform and is single-choice in the live form.
    const positions = [];
    for (let i = COL.positionFirst; i <= COL.positionLast; i++) if (clean(r[i])) positions.push(header[i]);
    if (positions.length > 1) flag(id, 'position', 'more than one position ticked, first kept', positions.join(' | '));
    const position = positions.length ? (POSITION_MAP[positions[0]] || null) : null;
    if (positions.length && !position) flag(id, 'position', 'no equivalent in the live form', positions[0]);

    const tactical = collapse(r, COL.tacticalFirst, COL.tacticalLast, header);
    const abilities = collapse(r, COL.abilitiesFirst, COL.abilitiesLast, header);

    const footRaw = clean(r[COL.foot]).toLowerCase();
    const foot = FOOT_MAP[footRaw] || null;
    if (footRaw && !foot) flag(id, 'foot', 'unmapped value', footRaw);

    const eduRaw = clean(r[COL.education]).toLowerCase();
    const education = EDUCATION_MAP[eduRaw] || null;
    if (eduRaw && !education) flag(id, 'education', 'unmapped value', eduRaw);
    if (eduRaw === 'junior high school') flag(id, 'education', 'no exact equivalent, mapped to Primary School', eduRaw);

    const youtube = clean(r[COL.youtube]);
    if (youtube && !/youtu\.?be/i.test(youtube)) flag(id, 'youtube-link', 'not a YouTube URL', youtube);

    const residence = clean(r[COL.residence]);
    if (residence && !/^[A-Za-z ]{3,}$/.test(residence)) flag(id, 'residence', 'free text, not a country from the list', residence);

    if (isRep && (clean(r[COL.repCompany]) || clean(r[COL.viaRepCompany]))) {
      flag(id, 'company', 'no column exists in the live schema, value dropped', clean(r[COL.repCompany]) || clean(r[COL.viaRepCompany]));
    }

    payloads[id] = {
      // Provenance. Requires migration/sql/001 to have been run.
      source_response_id: id,
      source_submitted_at: clean(r[COL.submitDate]) ? clean(r[COL.submitDate]).replace(' ', 'T') + 'Z' : null,
      source_network_id: clean(r[COL.networkId]) || null,

      // Requires sql/004. Recorded for every player, so false means checked and
      // false rather than never looked at.
      is_minor_at_submission: isMinor,
      age_at_submission: trueAge !== null && trueAge >= 0 ? trueAge : null,
      guardian_on_record: guardianOnRecord,
      response_type: clean(r[COL.responseType]) || null,
      created_at: clean(r[COL.submitDate]) ? clean(r[COL.submitDate]).replace(' ', 'T') + 'Z' : null,

      source: clean(r[COL.source]) || null,
      role: clean(r[COL.role]) || null,
      'minor-check': yesNo(r[COL.minorCheck]),

      'talent-contact_firstname': clean(r[COL.talentFirst]) || null,
      'talent-contact_lastname': clean(r[COL.talentLast]) || null,
      'talent-contact_phone': phone(r[COL.talentPhone]),
      'talent-contact_email': clean(r[COL.talentEmail]) || null,

      // Typeform never asked this question.
      'has-manager': null,
      'manager-contact_manager_firstname': null,
      'manager-contact_manager_lastname': null,
      'manager-contact_manager_phone': null,
      'manager-contact_manager_email': null,

      'rep-type': clean(r[COL.repType]) === 'Other' ? (clean(r[COL.repTypeOther]) || 'Other') : (clean(r[COL.repType]) || null),
      'rep-contact_rep_firstname': clean(r[COL.repFirst]) || null,
      'rep-contact_rep_lastname': clean(r[COL.repLast]) || null,
      'rep-contact_rep_phone': phone(r[COL.repPhone]),
      'rep-contact_rep_email': clean(r[COL.repEmail]) || null,

      'talent-info-for-rep_firstname': clean(r[COL.viaRepFirst]) || null,
      'talent-info-for-rep_lastname': clean(r[COL.viaRepLast]) || null,
      'talent-info-for-rep_phone': phone(r[COL.viaRepPhone]),
      'talent-info-for-rep_email': clean(r[COL.viaRepEmail]) || null,

      // File URLs are filled in from manifest.csv by link-media.js, not here.
      'cv-upload_url': null,
      'photo-portrait_url': null,
      'photo-front_url': null,
      'photo-rear_url': null,

      sex: clean(r[COL.sex]) === 'Other' ? (clean(r[COL.sexOther]) || null) : (clean(r[COL.sex]) || null),
      residence: residence || null,
      dob: isoDate(r[COL.dob]),
      age: statedAge,
      nationality: clean(r[COL.nationality]) || null,
      'dual-nationality-check': yesNo(r[COL.dualCheck]),
      'other-nationality': clean(r[COL.otherNationality]) || null,

      'academy-experience': yesNo(r[COL.academy]),
      'signed-pro': yesNo(r[COL.signedPro]),
      height: height(id, r[COL.height]),
      weight: intOrNull(r[COL.weight]),
      position,
      foot,
      'tactical-positions': tactical.join(', ') || null,
      'special-abilities': abilities.join(', ') || null,
      speed: speed(id, r[COL.speed]),

      education,
      'passport-check': yesNo(r[COL.passport]),
      'passport-expiry': isoDate(r[COL.passportExpiry]),
      'travel-experience': yesNo(r[COL.travel]),
      'current-club': clean(r[COL.club]) || null,
      'criminal-record': yesNo(r[COL.criminal]),
      'medical-condition': yesNo(r[COL.medical]),
      'surgery-check': yesNo(r[COL.surgery]),
      'youtube-link': youtube || null,
    };
  }

  fs.mkdirSync(PATHS.out, { recursive: true });
  fs.writeFileSync(`${PATHS.out}/payloads.json`, JSON.stringify(payloads, null, 2));

  // Why each absent response is absent. Without this the next step cannot tell a
  // response left out on purpose from one that failed to transform, and treats a
  // deliberate policy decision as an unresolved problem.
  fs.writeFileSync(`${PATHS.out}/excluded.json`,
    JSON.stringify(Object.fromEntries(skipped.map(s => [s.id, s.reason])), null, 2));
  fs.writeFileSync(PATHS.reviewFlags, toCsv([['response_id', 'field', 'issue', 'raw_value'], ...flags]));

  console.log(`payloads      ${Object.keys(payloads).length} responses ready`);
  console.log(`skipped       ${skipped.length}`);
  for (const s of skipped) console.log(`  ${s.id}  ${s.reason}`);

  if (minors.length) {
    const unaccompanied = minors.filter(m => !m.guardian);
    console.log(`\nminors        ${minors.length} under ${POLICY.minorAgeThreshold} at submission, being imported and flagged`);
    for (const m of minors.sort((a, b) => a.age - b.age)) {
      console.log(`  age ${String(m.age).padStart(2)}  ${m.id}  ${m.guardian ? 'guardian named on the record' : 'NO guardian named on the record'}`);
    }
    if (unaccompanied.length) {
      console.log(`\n  ${unaccompanied.length} of these has no representative or guardian named. The submission may`);
      console.log('  still have been made by one, but nothing on the record will say so.');
    }
  }
  console.log(`review flags  ${flags.length} (see migration/review_flags.csv)`);
};

main();
