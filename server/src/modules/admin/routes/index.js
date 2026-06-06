'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/admin.controller');
const { validate } = require('../../../shared/validators/validate');
const { createUserValidator, updateUserValidator, resetPasswordValidator, updateSettingValidator } = require('../validators/admin.validator');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

/* ── User Management ─────────────────────────────────────────────────────── */
router.post('/users', createUserValidator, validate, ctrl.createUser);
router.get('/users', ctrl.listUsers);
router.get('/users/:id', ctrl.getUserById);
router.patch('/users/:id', updateUserValidator, validate, ctrl.updateUser);
router.patch('/users/:id/password', resetPasswordValidator, validate, ctrl.resetPassword);
router.delete('/users/:id', ctrl.deleteUser);

/* ── Settings ────────────────────────────────────────────────────────────── */
router.get('/settings', ctrl.getAllSettings);
router.patch('/settings/:key', updateSettingValidator, validate, ctrl.updateSetting);

/* ── Dashboard Analytics ─────────────────────────────────────────────────── */
router.get('/dashboard-stats', ctrl.getDashboardStats);

module.exports = router;
