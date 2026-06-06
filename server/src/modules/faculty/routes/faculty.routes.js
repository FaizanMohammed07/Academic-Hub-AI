'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/faculty.controller');

router.get(
  '/dashboard',
  authenticate,
  authorize('faculty'),
  ctrl.getDashboard,
);

router.get(
  '/subjects',
  authenticate,
  authorize('faculty'),
  ctrl.getMySubjects,
);

router.get(
  '/stats',
  authenticate,
  authorize('faculty', 'hod'),
  ctrl.getStats,
);

router.get(
  '/subjects/:id/students',
  authenticate,
  authorize('faculty', 'hod'),
  ctrl.getSubjectStudents,
);

module.exports = router;
