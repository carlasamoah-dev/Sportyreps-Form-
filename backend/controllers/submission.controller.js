const catchAsync = require('../utils/catchAsync');
const storageService = require('../services/storage.service');
const dbService = require('../services/db.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const handleSubmission = catchAsync(async (req, res) => {
  const body = req.body;
  const files = req.files || [];

  // Identify files by their fieldname (coming from FormData keys in frontend)
  // e.g. "cv-upload", "photo-portrait", "photo-front", "photo-rear"
  const cvFile = files.find(f => f.fieldname === 'cv-upload');
  const portraitFile = files.find(f => f.fieldname === 'photo-portrait');
  const frontFile = files.find(f => f.fieldname === 'photo-front');
  const rearFile = files.find(f => f.fieldname === 'photo-rear');

  // We require the 3 photos per the config rules. Zod validated text, but Multer handles files
  if (!portraitFile || !frontFile || !rearFile) {
    return res.status(400).json({ code: 400, message: "Missing required photo uploads." });
  }

  // 1. Upload files to Supabase Storage
  logger.info(`Uploading files for new submission...`);
  const [cvUrl, portraitUrl, frontUrl, rearUrl] = await Promise.all([
    cvFile ? storageService.uploadFile(cvFile, 'cvs') : Promise.resolve(null),
    storageService.uploadFile(portraitFile, 'photos'),
    storageService.uploadFile(frontFile, 'photos'),
    storageService.uploadFile(rearFile, 'photos')
  ]);

  // 2. Prepare database payload
  const dbPayload = {
    ...body,
    'cv-upload_url': cvUrl,
    'photo-portrait_url': portraitUrl,
    'photo-front_url': frontUrl,
    'photo-rear_url': rearUrl,
    created_at: new Date().toISOString()
  };

  // 3. Save to database
  logger.info(`Saving submission to database...`);
  const savedRecord = await dbService.saveSubmission(dbPayload);

  // 4. Send email notification (non-blocking)
  const fileUrls = { cv: cvUrl, portrait: portraitUrl, front: frontUrl, rear: rearUrl };
  emailService.sendNotificationEmail(body, fileUrls);

  res.status(201).json({
    code: 201,
    message: "Application submitted successfully",
    data: {
      id: savedRecord.id
    }
  });
});

module.exports = {
  handleSubmission
};
