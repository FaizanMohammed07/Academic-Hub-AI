'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/observation.controller');
const { validate } = require('../../../shared/validators/validate');
const { createObservationValidator, evaluateObservationValidator } = require('../validators/observation.validator');

router.post(
  '/',
  authenticate,
  authorize('faculty'),
  createObservationValidator,
  validate,
  ctrl.createObservation,
);

router.post(
  '/bulk',
  authenticate,
  authorize('faculty'),
  ctrl.bulkCreate,
);

router.get(
  '/',
  authenticate,
  authorize('faculty', 'hod'),
  ctrl.getFacultyObservations,
);

router.get(
  '/my',
  authenticate,
  authorize('student'),
  ctrl.getMyObservations,
);

router.patch(
  '/:id/evaluate',
  authenticate,
  authorize('faculty'),
  evaluateObservationValidator,
  validate,
  ctrl.evaluateObservation,
);

module.exports = router;
