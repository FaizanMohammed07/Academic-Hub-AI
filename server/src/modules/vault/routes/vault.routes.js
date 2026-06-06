'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const {
  getVaultSummary,
  getCertificates,
  getCertificateById,
  generateCertificate,
  verifyCertificate,
} = require('../controllers/vault.controller');

// Public — no auth required
router.get('/verify/:code', verifyCertificate);

// Student
router.get('/summary', authenticate, authorize('student'), getVaultSummary);
router.get('/certificates', authenticate, authorize('student'), getCertificates);

// Student or Admin
router.get(
  '/certificates/:id',
  authenticate,
  authorize('student', 'admin'),
  getCertificateById
);

// Admin only
router.post('/certificates', authenticate, authorize('admin'), generateCertificate);

module.exports = router;
