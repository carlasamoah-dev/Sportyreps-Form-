const express = require('express');
const { handleSubmission, getSubmissions } = require('../controllers/submission.controller');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const requireAuth = require('../middlewares/auth.middleware');
const { submissionSchema } = require('../validators/submission.validator');

const router = express.Router();

// GET /api/submissions — Admin panel reads all submissions (PROTECTED: requires login)
router.get('/', requireAuth, getSubmissions);

// POST /api/submissions — Client submits a new form entry (PUBLIC: no auth needed)
router.post(
  '/',
  upload.any(),
  validate(submissionSchema),
  handleSubmission
);

module.exports = router;
