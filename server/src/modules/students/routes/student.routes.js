'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/student.controller');

router.get(
  '/dashboard',
  authenticate,
  authorize('student'),
  ctrl.getDashboard,
);

router.get(
  '/subjects',
  authenticate,
  authorize('student'),
  ctrl.getSubjects,
);

router.get(
  '/assignments',
  authenticate,
  authorize('student'),
  ctrl.getAssignments,
);

router.get(
  '/stats',
  authenticate,
  authorize('student'),
  ctrl.getStats,
);

module.exports = router;
