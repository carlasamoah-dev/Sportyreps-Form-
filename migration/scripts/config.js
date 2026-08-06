/**
 * Shared configuration for the Typeform back-migration.
 *
 * Everything that is a policy decision (rather than a fact about the data)
 * lives here so it can be changed in one place and reviewed in one diff.
 */

const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Paths ─────────────────────────────────────────────────────────────────────
const PATHS = {
  root: ROOT,
  // The raw Typeform export. Deliberately NOT committed: it holds names, phone
  // numbers, emails and dates of birth, including those of minors.
  sourceCsv: process.env.SOURCE_CSV || path.join(ROOT, 'source', 'responses.csv'),
  fileIndex: path.join(ROOT, 'file_index.csv'),
  manifest: path.join(ROOT, 'manifest.csv'),
  reviewFlags: path.join(ROOT, 'review_flags.csv'),
  batches: path.join(ROOT, 'batches.md'),
  incoming: path.join(ROOT, 'incoming'),   // where a dropped batch is staged
  out: path.join(ROOT, 'out'),             // generated payloads (gitignored)
};

// ── Source CSV column positions ───────────────────────────────────────────────
// Typeform repeats header labels ("First name" appears three times), so columns
// are addressed by index, never by name.
const COL = {
  responseId: 0,
  source: 1,
  role: 2,
  minorCheck: 3,
  talentFirst: 4, talentLast: 5, talentPhone: 6, talentEmail: 7,
  repType: 8, repTypeOther: 9,
  repFirst: 10, repLast: 11, repPhone: 12, repEmail: 13, repCompany: 14,
  viaRepFirst: 15, viaRepLast: 16, viaRepPhone: 17, viaRepEmail: 18, viaRepCompany: 19,
  cv: 20, portrait: 21, front: 22, rear: 23,
  sex: 24, sexOther: 25,
  residence: 26, dob: 27, age: 28, nationality: 29,
  dualCheck: 30, otherNationality: 31,
  academy: 32, signedPro: 33,
  height: 34, weight: 35,
  positionFirst: 36, positionLast: 39,      // Goalkeeper, Defender, Midfielder, Striker
  foot: 40,
  tacticalFirst: 41, tacticalLast: 50,      // 10 checkbox columns
  abilitiesFirst: 51, abilitiesLast: 61,    // 11 checkbox columns
  speed: 62, education: 63,
  passport: 64, travel: 65, passportExpiry: 66,
  club: 67, medical: 68, surgery: 69, criminal: 70,
  youtube: 71,
  responseType: 72, startDate: 73, stageDate: 74, submitDate: 75, networkId: 76,
};

// ── File slots ────────────────────────────────────────────────────────────────
const SLOTS = [
  { slot: 'cv',       col: COL.cv,       dbColumn: 'cv-upload_url',      kind: 'document' },
  { slot: 'portrait', col: COL.portrait, dbColumn: 'photo-portrait_url', kind: 'image' },
  { slot: 'front',    col: COL.front,    dbColumn: 'photo-front_url',    kind: 'image' },
  { slot: 'rear',     col: COL.rear,     dbColumn: 'photo-rear_url',     kind: 'image' },
];

// ── Storage routing ───────────────────────────────────────────────────────────
// Files are routed by their ACTUAL extension, not by the slot they were uploaded
// into, because 34 of the 200 source files sit in the wrong slot (images used as
// CVs, PDFs used as photos). Routing by content keeps every bucket's MIME
// allowlist satisfied while the slot-to-column mapping stays intact.
const EXT_MIME = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.heic': 'image/heic',
  '.mov': 'video/quicktime', '.mp4': 'video/mp4',
};

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];
const DOC_EXTS = ['.pdf', '.doc', '.docx', '.pptx'];
const VIDEO_EXTS = ['.mov', '.mp4'];

const bucketForExt = (ext) => {
  if (IMAGE_EXTS.includes(ext)) return 'photos';
  if (DOC_EXTS.includes(ext)) return 'cvs';
  if (VIDEO_EXTS.includes(ext)) return 'media';   // requires sql/001 to be run
  return null;                                    // unknown -> quarantine
};

// Canonical object path. Identity and slot are encoded in the path itself, so a
// wrongly filed object is visible by eye in the Supabase dashboard.
const storagePath = (responseId, slot, ext) => `typeform-2024/${responseId}/${slot}${ext}`;

// ── Policy decisions ──────────────────────────────────────────────────────────
const POLICY = {
  // The live form ends the journey for under-18s, and the first pass left the 11
  // legacy under-18s out on that basis. They are now imported, because those
  // responses were completed by guardians on the players' behalf, which is a
  // different situation from a child filling the form in unsupervised.
  //
  // Importing them puts a duty on the record rather than removing one, so every
  // imported row carries is_minor_at_submission, age_at_submission and
  // guardian_on_record (see sql/004). Set this back to true to leave them out,
  // and run prune-excluded.js afterwards to take their files out of Storage.
  excludeMinors: false,

  // Age is computed from DOB against submit date, not taken from the self-reported
  // age field, which disagrees with DOB on one row and is absent on others.
  minorAgeThreshold: 18,

  // Batch size in responses (each response is up to 4 files).
  batchSize: 5,
};

// ── Value maps ────────────────────────────────────────────────────────────────
const FOOT_MAP = { 'right-footed': 'Right', 'left-footed': 'Left', 'both-footed': 'Both' };

const EDUCATION_MAP = {
  'primary school': 'Primary School',
  'junior high school': 'Primary School',        // no exact equivalent in the live form
  'high school': 'High School / Secondary',
  'university': 'Undergraduate Degree',
};

// Typeform offered Striker; the live form calls it Forward.
const POSITION_MAP = {
  'Goalkeeper': 'Goalkeeper',
  'Defender': 'Defender',
  'Midfielder': 'Midfielder',
  'Striker': 'Forward',
};

module.exports = {
  PATHS, COL, SLOTS, EXT_MIME, IMAGE_EXTS, DOC_EXTS, VIDEO_EXTS,
  bucketForExt, storagePath, POLICY, FOOT_MAP, EDUCATION_MAP, POSITION_MAP,
};
