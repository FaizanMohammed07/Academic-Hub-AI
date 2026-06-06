'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/assignment.controller');
const { validate } = require('../../../shared/validators/validate');
const { createAssignmentValidator, updateAssignmentValidator } = require('../validators/assignment.validator');

router.post(
  '/',
  authenticate,
  authorize('faculty'),
  createAssignmentValidator,
  validate,
  ctrl.createAssignment,
);

router.get(
  '/',
  authenticate,
  authorize('faculty'),
  ctrl.getMyAssignments,
);

router.get(
  '/subject/:subjectId',
  authenticate,
  authorize('faculty', 'hod'),
  ctrl.getAssignmentsBySubject,
);

router.get(
  '/:id',
  authenticate,
  authorize('faculty', 'student', 'hod'),
  ctrl.getAssignmentById,
);

router.patch(
  '/:id',
  authenticate,
  authorize('faculty'),
  updateAssignmentValidator,
  validate,
  ctrl.updateAssignment,
);

router.delete(
  '/:id',
  authenticate,
  authorize('faculty'),
  ctrl.deleteAssignment,
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('faculty'),
  ctrl.publishAssignment,
);

router.get(
  '/:id/submissions',
  authenticate,
  authorize('faculty', 'hod'),
  ctrl.getSubmissions,
);

module.exports = router;
