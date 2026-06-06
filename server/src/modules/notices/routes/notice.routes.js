'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const {
  createNotice,
  publishNotice,
  updateNotice,
  deleteNotice,
  getNotices,
  getNoticeById,
} = require('../controllers/notice.controller');
const { validate } = require('../../../shared/validators/validate');
const { createNoticeValidator } = require('../validators/notice.validator');

router.post('/', authenticate, authorize('hod', 'admin'), createNoticeValidator, validate, createNotice);
router.get('/', authenticate, getNotices);
router.get('/:id', authenticate, getNoticeById);
// publish must be registered before the generic /:id PATCH to avoid capture
router.patch('/:id/publish', authenticate, authorize('hod', 'admin'), publishNotice);
router.patch('/:id', authenticate, authorize('hod', 'admin'), updateNotice);
router.delete('/:id', authenticate, authorize('hod', 'admin'), deleteNotice);

module.exports = router;
