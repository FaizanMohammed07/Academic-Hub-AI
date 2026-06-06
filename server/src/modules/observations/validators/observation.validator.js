'use strict';

const { body } = require('express-validator');

const createObservationValidator = [
  body('subject').isMongoId().withMessage('subject must be a valid MongoDB ID'),
  body('semester').isMongoId().withMessage('semester must be a valid MongoDB ID'),
  body('student').isMongoId().withMessage('student must be a valid MongoDB ID'),
  body('experimentNumber').isInt({ min: 1 }).withMessage('experimentNumber must be a positive integer'),
  body('experimentTitle').notEmpty().withMessage('experimentTitle is required'),
  body('date').isISO8601().withMessage('date must be a valid ISO 8601 date'),
  body('maxMarks').optional().isInt({ min: 1, max: 100 }).withMessage('maxMarks must be between 1 and 100'),
];

const evaluateObservationValidator = [
  body('marks').isFloat({ min: 0 }).withMessage('marks must be a non-negative number'),
  body('remarks').optional().isString().withMessage('remarks must be a string'),
];

module.exports = { createObservationValidator, evaluateObservationValidator };
