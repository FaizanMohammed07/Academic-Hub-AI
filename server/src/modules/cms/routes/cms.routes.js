'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/cms.controller');
const { validate } = require('../../../shared/validators/validate');
const {
  upsertSectionValidator,
  createGalleryValidator,
  createVideoValidator,
  createAchievementValidator,
  createPlacementValidator,
  createAlumniValidator,
  createEventValidator,
} = require('../validators/cms.validator');

const adminGuard = [authenticate, authorize('admin')];

/* ══════════════════════════════════════════════
   PUBLIC ROUTES — no authentication required
══════════════════════════════════════════════ */
router.get('/public', ctrl.getAllPublicSections);
router.get('/public/gallery', ctrl.getGallery);
router.get('/public/videos', ctrl.getVideos);
router.get('/public/achievements', ctrl.getAchievements);
router.get('/public/placements', ctrl.getPlacements);
router.get('/public/alumni', ctrl.getAlumni);
router.get('/public/events', ctrl.getEvents);

/* ══════════════════════════════════════════════
   ADMIN MANAGEMENT ROUTES
══════════════════════════════════════════════ */

// Sections
router.post('/sections', ...adminGuard, upsertSectionValidator, validate, ctrl.upsertSection);
router.get('/sections/:key', ...adminGuard, ctrl.getSection);

// Gallery
router.post('/gallery', ...adminGuard, createGalleryValidator, validate, ctrl.createGalleryItem);
router.patch('/gallery/:id', ...adminGuard, ctrl.updateGalleryItem);
router.delete('/gallery/:id', ...adminGuard, ctrl.deleteGalleryItem);

// Videos
router.post('/videos', ...adminGuard, createVideoValidator, validate, ctrl.createVideo);
router.patch('/videos/:id', ...adminGuard, ctrl.updateVideo);
router.delete('/videos/:id', ...adminGuard, ctrl.deleteVideo);

// Achievements
router.post('/achievements', ...adminGuard, createAchievementValidator, validate, ctrl.createAchievement);
router.patch('/achievements/:id', ...adminGuard, ctrl.updateAchievement);
router.delete('/achievements/:id', ...adminGuard, ctrl.deleteAchievement);

// Placements
router.post('/placements', ...adminGuard, createPlacementValidator, validate, ctrl.createPlacement);
router.patch('/placements/:id', ...adminGuard, ctrl.updatePlacement);
router.delete('/placements/:id', ...adminGuard, ctrl.deletePlacement);

// Alumni
router.post('/alumni', ...adminGuard, createAlumniValidator, validate, ctrl.createAlumni);
router.patch('/alumni/:id', ...adminGuard, ctrl.updateAlumni);
router.delete('/alumni/:id', ...adminGuard, ctrl.deleteAlumni);

// Events
router.post('/events', ...adminGuard, createEventValidator, validate, ctrl.createEvent);
router.patch('/events/:id', ...adminGuard, ctrl.updateEvent);
router.delete('/events/:id', ...adminGuard, ctrl.deleteEvent);

module.exports = router;
