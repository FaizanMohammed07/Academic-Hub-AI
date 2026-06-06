'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/analytics.controller');

router.get('/platform',      authenticate, authorize('admin'), ctrl.getPlatformAnalytics);
router.get('/semester/:id',  authenticate, authorize('hod', 'admin'), ctrl.getSemesterAnalytics);
router.get('/subject/:id',   authenticate, authorize('faculty', 'hod', 'admin'), ctrl.getSubjectAnalytics);

module.exports = router;
