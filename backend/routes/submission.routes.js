const express = require('express');
const { handleSubmission, getSubmissions, archiveSubmission, restoreSubmission } = require('../controllers/submission.controller');
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

// DELETE /api/submissions/:id — Admin archives an entry (PROTECTED)
// Archive, not destroy: the row and its uploaded files stay, it simply leaves
// the list. See sql/001_archive_submissions.sql for why.
router.delete('/:id', requireAuth, archiveSubmission);

// POST /api/submissions/:id/restore — Admin puts an archived entry back (PROTECTED)
router.post('/:id/restore', requireAuth, restoreSubmission);

module.exports = router;
