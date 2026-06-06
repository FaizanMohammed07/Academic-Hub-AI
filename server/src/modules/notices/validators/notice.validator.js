'use strict';

const { body } = require('express-validator');

const createNoticeValidator = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['general', 'urgent', 'academic', 'event']).withMessage('type must be one of: general, urgent, academic, event'),
  body('targetRoles').optional().isArray().withMessage('targetRoles must be an array'),
];

module.exports = { createNoticeValidator };
