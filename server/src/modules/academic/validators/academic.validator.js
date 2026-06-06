'use strict';

const { body } = require('express-validator');

const createAcademicYearValidator = [
  body('name').notEmpty().withMessage('Name is required').matches(/^\d{4}-\d{2}$/).withMessage('Name must match pattern YYYY-YY (e.g. 2024-25)'),
  body('startDate').isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  body('endDate').isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
];

const createSemesterValidator = [
  body('academicYear').isMongoId().withMessage('academicYear must be a valid MongoDB ID'),
  body('number').isInt({ min: 1, max: 8 }).withMessage('Semester number must be between 1 and 8'),
  body('name').notEmpty().withMessage('Semester name is required'),
];

const createSubjectValidator = [
  body('code').notEmpty().withMessage('Subject code is required').toUpperCase(),
  body('name').notEmpty().withMessage('Subject name is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('type').isIn(['theory', 'lab', 'elective']).withMessage('Type must be one of: theory, lab, elective'),
  body('semester').isMongoId().withMessage('semester must be a valid MongoDB ID'),
  body('academicYear').isMongoId().withMessage('academicYear must be a valid MongoDB ID'),
];

const assignFacultyValidator = [
  body('faculty').isMongoId().withMessage('faculty must be a valid MongoDB ID'),
  body('subject').isMongoId().withMessage('subject must be a valid MongoDB ID'),
  body('semester').isMongoId().withMessage('semester must be a valid MongoDB ID'),
  body('academicYear').isMongoId().withMessage('academicYear must be a valid MongoDB ID'),
];

const enrollStudentsValidator = [
  body('studentIds').isArray({ min: 1 }).withMessage('studentIds must be a non-empty array'),
  body('studentIds.*').isMongoId().withMessage('Each studentId must be a valid MongoDB ID'),
  body('semesterId').isMongoId().withMessage('semesterId must be a valid MongoDB ID'),
];

const saveTimetableValidator = [
  body('semester').isMongoId().withMessage('semester must be a valid MongoDB ID'),
  body('slots').isArray({ min: 1 }).withMessage('slots must be a non-empty array'),
];

module.exports = {
  createAcademicYearValidator,
  createSemesterValidator,
  createSubjectValidator,
  assignFacultyValidator,
  enrollStudentsValidator,
  saveTimetableValidator,
};
