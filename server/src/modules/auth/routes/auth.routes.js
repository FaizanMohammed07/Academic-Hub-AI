const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../../../shared/validators/validate');

const loginRules = [
  body('loginId').notEmpty().trim(),
  body('password').notEmpty(),
  body('role').isIn(['student', 'faculty', 'hod', 'admin']),
];

router.post('/login',           loginRules, validate, ctrl.login);
router.post('/refresh',         body('refreshToken').notEmpty(), validate, ctrl.refresh);
router.post('/logout',          authenticate, ctrl.logout);
router.post('/forgot-password', body('email').isEmail(), validate, ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);
router.get('/me',               authenticate, ctrl.getMe);

module.exports = router;
