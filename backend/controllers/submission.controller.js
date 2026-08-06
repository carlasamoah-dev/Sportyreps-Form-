const catchAsync = require('../utils/catchAsync');
const supabase = require('../config/supabase');
const storageService = require('../services/storage.service');
const dbService = require('../services/db.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

/**
 * GET /api/submissions
 * Returns all submissions from the database, sorted newest first.
 * Used by the Admin Panel to populate the data grid.
 */
/**
 * A Supabase client acting as the logged-in admin.
 *
 * The backend only holds the anon key, so every admin query has to carry the
 * admin's own JWT to satisfy row level security. requireAuth has already
 * verified that token before any of this runs.
 */
const asAdmin = (req) => {
  const token = req.headers['authorization'].split(' ')[1];
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

const getSubmissions = catchAsync(async (req, res) => {
  const adminSupabase = asAdmin(req);

  // Archived submissions are hidden unless asked for explicitly, and are never
  // mixed in with the active ones: a list that silently included them would
  // make archiving look like it had not worked.
  const wantArchived = req.query.archived === '1' || req.query.archived === 'true';

  let query = adminSupabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  query = wantArchived
    ? query.not('deleted_at', 'is', null)
    : query.is('deleted_at', null);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }

  res.status(200).json({
    code: 200,
    count: data.length,
    data
  });
});

/**
 * POST /api/submissions
 * Handles a new form submission from the client.
 * Uploads files → saves to DB → sends email notification.
 */
const handleSubmission = catchAsync(async (req, res) => {
  const body = req.body;
  const files = req.files || [];

  // Identify files by their fieldname (coming from FormData keys in frontend)
  const cvFile = files.find(f => f.fieldname === 'cv-upload');
  const portraitFile = files.find(f => f.fieldname === 'photo-portrait');
  const frontFile = files.find(f => f.fieldname === 'photo-front');
  const rearFile = files.find(f => f.fieldname === 'photo-rear');

  // Photos are required per form config
  if (!portraitFile || !frontFile || !rearFile) {
    return res.status(400).json({ code: 400, message: "Missing required photo uploads (portrait, front, rear)." });
  }

  // 1. Upload files to Supabase Storage
  logger.info(`Uploading files for new submission...`);
  const [cvUrl, portraitUrl, frontUrl, rearUrl] = await Promise.all([
    cvFile ? storageService.uploadFile(cvFile, 'cvs') : Promise.resolve(null),
    storageService.uploadFile(portraitFile, 'photos'),
    storageService.uploadFile(frontFile, 'photos'),
    storageService.uploadFile(rearFile, 'photos')
  ]);

  // 2. Prepare database payload — flatten all form fields + file URLs
  // Remove formId as it is not in the database schema
  const payloadBody = { ...body };
  delete payloadBody.formId;

  const dbPayload = {
    ...payloadBody,
    'cv-upload_url': cvUrl,
    'photo-portrait_url': portraitUrl,
    'photo-front_url': frontUrl,
    'photo-rear_url': rearUrl,
    created_at: new Date().toISOString()
  };

  // 3. Save to database
  logger.info(`Saving submission to database...`);
  const savedRecord = await dbService.saveSubmission(dbPayload);

  // 4. Send email notification (non-blocking — we don't await so user isn't held up)
  const fileUrls = { cv: cvUrl, portrait: portraitUrl, front: frontUrl, rear: rearUrl };
  emailService.sendNotificationEmail(body, fileUrls).catch(err => {
    logger.error(`Email notification failed silently: ${err.message}`);
  });

  res.status(201).json({
    code: 201,
    message: "Application submitted successfully",
    data: { success: true }
  });
});


/**
 * DELETE /api/submissions/:id
 *
 * Archives rather than deletes: the row keeps its data and its uploaded files,
 * and stops appearing in the admin list. Restorable, because Supabase Storage
 * has no recycle bin and for the migrated players the only other copy of their
 * photographs is on one laptop.
 */
const archiveSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await asAdmin(req)
    .from('submissions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)      // archiving twice must not move the timestamp
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`Failed to archive submission: ${error.message}`);
  if (!data) {
    return res.status(404).json({ code: 404, message: 'No active submission with that id.' });
  }

  logger.info(`Submission ${id} archived by ${req.user?.email || 'unknown admin'}`);
  res.status(200).json({ code: 200, message: 'Submission archived.', data });
});

/**
 * POST /api/submissions/:id/restore
 *
 * Puts an archived submission back. Archiving is only reversible if this exists,
 * so it ships with it rather than after it.
 */
const restoreSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await asAdmin(req)
    .from('submissions')
    .update({ deleted_at: null })
    .eq('id', id)
    .not('deleted_at', 'is', null)
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`Failed to restore submission: ${error.message}`);
  if (!data) {
    return res.status(404).json({ code: 404, message: 'No archived submission with that id.' });
  }

  logger.info(`Submission ${id} restored by ${req.user?.email || 'unknown admin'}`);
  res.status(200).json({ code: 200, message: 'Submission restored.', data });
});

module.exports = {
  getSubmissions,
  handleSubmission,
  archiveSubmission,
  restoreSubmission
};
