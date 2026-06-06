'use strict';

const { body } = require('express-validator');

const createAssignmentValidator = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('subject').isMongoId().withMessage('subject must be a valid MongoDB ID'),
  body('semester').isMongoId().withMessage('semester must be a valid MongoDB ID'),
  body('type')
    .isIn(['assignment1', 'assignment2', 'lab_observation', 'record', 'tutorial', 'mini_project'])
    .withMessage('type must be one of: assignment1, assignment2, lab_observation, record, tutorial, mini_project'),
  body('dueDate').isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body('maxMarks').isInt({ min: 1, max: 100 }).withMessage('maxMarks must be between 1 and 100'),
];

const updateAssignmentValidator = [
  body('title').optional().notEmpty().withMessage('Title must not be empty if provided'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body('maxMarks').optional().isInt({ min: 1 }).withMessage('maxMarks must be at least 1'),
];

module.exports = { createAssignmentValidator, updateAssignmentValidator };
