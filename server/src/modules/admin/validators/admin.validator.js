'use strict';

const { body } = require('express-validator');

const createUserValidator = [
  body('role').isIn(['student', 'faculty', 'hod', 'admin']).withMessage('role must be one of: student, faculty, hod, admin'),
  body('loginId').notEmpty().withMessage('loginId is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('fullName').notEmpty().withMessage('fullName is required').trim().isLength({ min: 2, max: 100 }).withMessage('fullName must be between 2 and 100 characters'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
];

const updateUserValidator = [
  body('fullName').optional().notEmpty().withMessage('fullName must not be empty if provided'),
  body('email').optional().isEmail().withMessage('email must be a valid email'),
  body('phone').optional().isMobilePhone().withMessage('phone must be a valid phone number'),
];

const resetPasswordValidator = [
  body('newPassword').isLength({ min: 6 }).withMessage('newPassword must be at least 6 characters'),
];

const updateSettingValidator = [
  body('value').exists().withMessage('value is required'),
];

module.exports = { createUserValidator, updateUserValidator, resetPasswordValidator, updateSettingValidator };
