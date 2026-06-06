'use strict';

const { body } = require('express-validator');

const loginValidator = [
  body('loginId').notEmpty().withMessage('Login ID is required').trim(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'hod', 'admin']).withMessage('Role must be one of: student, faculty, hod, admin'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = { loginValidator, forgotPasswordValidator, resetPasswordValidator };
