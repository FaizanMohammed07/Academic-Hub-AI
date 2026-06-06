'use strict';

const { body } = require('express-validator');

const upsertSectionValidator = [
  body('data').exists().withMessage('data is required').isObject().withMessage('data must be an object'),
];

const createGalleryValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('imageUrl').notEmpty().withMessage('imageUrl is required'),
  body('category')
    .isIn(['events', 'labs', 'achievements', 'graduation', 'sports', 'hackathons', 'other'])
    .withMessage('category must be one of: events, labs, achievements, graduation, sports, hackathons, other'),
];

const createVideoValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('videoUrl').notEmpty().withMessage('videoUrl is required'),
  body('type').isIn(['s3', 'youtube']).withMessage('type must be one of: s3, youtube'),
];

const createAchievementValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type')
    .isIn(['sih', 'hackathon', 'sports', 'academic', 'research', 'internship', 'placement', 'other'])
    .withMessage('type must be one of: sih, hackathon, sports, academic, research, internship, placement, other'),
  body('year').isInt({ min: 2000 }).withMessage('year must be a valid year (>= 2000)'),
];

const createPlacementValidator = [
  body('studentName').notEmpty().withMessage('studentName is required'),
  body('company').notEmpty().withMessage('company is required'),
  body('role').notEmpty().withMessage('role is required'),
  body('package').isFloat({ min: 0 }).withMessage('package must be a non-negative number'),
  body('year').isInt({ min: 2000 }).withMessage('year must be a valid year (>= 2000)'),
];

const createAlumniValidator = [
  body('name').notEmpty().withMessage('name is required'),
  body('batch').notEmpty().withMessage('batch is required'),
  body('company').notEmpty().withMessage('company is required'),
];

const createEventValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['seminar', 'workshop', 'hackathon', 'sports', 'cultural', 'other']).withMessage('type must be one of: seminar, workshop, hackathon, sports, cultural, other'),
  body('startDate').isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
];

module.exports = {
  upsertSectionValidator,
  createGalleryValidator,
  createVideoValidator,
  createAchievementValidator,
  createPlacementValidator,
  createAlumniValidator,
  createEventValidator,
};
