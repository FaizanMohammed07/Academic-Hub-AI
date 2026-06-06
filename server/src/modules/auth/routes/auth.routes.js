const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../../../shared/validators/validate');
const { loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth.validator');

router.post('/login',           loginValidator, validate, ctrl.login);
router.post('/refresh',         body('refreshToken').notEmpty(), validate, ctrl.refresh);
router.post('/logout',          authenticate, ctrl.logout);
router.post('/forgot-password', forgotPasswordValidator, validate, ctrl.forgotPassword);
router.post('/reset-password',  resetPasswordValidator, validate, ctrl.resetPassword);
router.get('/me',               authenticate, ctrl.getMe);
router.patch('/me',             authenticate, ctrl.updateProfile);

module.exports = router;
