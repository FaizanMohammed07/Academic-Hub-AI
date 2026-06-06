'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const { getUploadUrl, getDownloadUrl, deleteFile } = require('../controllers/media.controller');

// Any authenticated user can request an upload URL
router.post('/upload-url', authenticate, getUploadUrl);

// Faculty, HOD, Admin can generate download URLs (for submissions etc.)
router.post('/download-url', authenticate, authorize('faculty', 'hod', 'admin'), getDownloadUrl);

// Admin only — hard-delete from S3
router.delete('/file', authenticate, authorize('admin'), deleteFile);

module.exports = router;
