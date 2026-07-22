const express = require('express');
const { handleSubmission } = require('../controllers/submission.controller');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { submissionSchema } = require('../validators/submission.validator');

const router = express.Router();

// The fields array should match all possible file upload fields
const fileFields = [
  { name: 'cv-upload', maxCount: 1 },
  { name: 'photo-portrait', maxCount: 1 },
  { name: 'photo-front', maxCount: 1 },
  { name: 'photo-rear', maxCount: 1 }
];

router.post(
  '/',
  upload.any(), // Accept any files, we manually filter in controller to allow dynamic FormData
  validate(submissionSchema),
  handleSubmission
);

module.exports = router;
