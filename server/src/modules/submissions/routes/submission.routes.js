'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/submission.controller');
const { validate } = require('../../../shared/validators/validate');
const { submitAssignmentValidator, evaluateSubmissionValidator, getUploadUrlValidator } = require('../validators/submission.validator');

router.get(
  '/upload-url',
  authenticate,
  authorize('student'),
  ctrl.getUploadUrl,
);

router.post(
  '/upload-url',
  authenticate,
  getUploadUrlValidator,
  validate,
  ctrl.getUploadUrl,
);

router.post(
  '/',
  authenticate,
  authorize('student'),
  submitAssignmentValidator,
  validate,
  ctrl.submitAssignment,
);

router.get(
  '/',
  authenticate,
  authorize('student'),
  ctrl.getMySubmissions,
);

router.get(
  '/:id',
  authenticate,
  authorize('student', 'faculty', 'hod'),
  ctrl.getSubmissionById,
);

router.patch(
  '/:id/evaluate',
  authenticate,
  authorize('faculty'),
  evaluateSubmissionValidator,
  validate,
  ctrl.evaluateSubmission,
);

module.exports = router;
