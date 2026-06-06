'use strict';

const { body } = require('express-validator');

const submitAssignmentValidator = [
  body('assignmentId').isMongoId().withMessage('assignmentId must be a valid MongoDB ID'),
  body('fileUrl').notEmpty().withMessage('fileUrl is required').isURL({ require_tld: false }).withMessage('fileUrl must be a valid URL'),
  body('fileName').notEmpty().withMessage('fileName is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('fileSize must be a positive integer'),
];

const evaluateSubmissionValidator = [
  body('status').isIn(['approved', 'rejected']).withMessage('status must be one of: approved, rejected'),
  body('marks').isFloat({ min: 0 }).withMessage('marks must be a non-negative number'),
  body('feedback').optional().isString().withMessage('feedback must be a string'),
];

const getUploadUrlValidator = [
  body('fileName').notEmpty().withMessage('fileName is required'),
  body('fileType').notEmpty().withMessage('fileType is required'),
  body('folder')
    .isIn(['submissions', 'assignments', 'certificates', 'faculty', 'hod', 'gallery', 'videos'])
    .withMessage('folder must be one of: submissions, assignments, certificates, faculty, hod, gallery, videos'),
];

module.exports = { submitAssignmentValidator, evaluateSubmissionValidator, getUploadUrlValidator };
