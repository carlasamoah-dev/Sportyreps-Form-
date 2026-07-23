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
const getSubmissions = catchAsync(async (req, res) => {
  // Grab the admin's JWT token that was validated by the auth middleware
  const token = req.headers['authorization'].split(' ')[1];

  // Create a dynamic Supabase client acting as the authenticated admin
  // This allows the query to pass the Row Level Security (RLS) 'SELECT' policy
  const adminSupabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await adminSupabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

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

module.exports = {
  getSubmissions,
  handleSubmission
};
