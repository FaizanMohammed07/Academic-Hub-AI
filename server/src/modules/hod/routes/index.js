'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const {
  getDashboard,
  getFacultyPerformance,
  getStudentPerformance,
  getDepartmentAnalytics,
  getAssignmentStats,
} = require('../controllers/hod.controller');

const guard = [authenticate, authorize('hod', 'admin')];

router.get('/dashboard', ...guard, getDashboard);
router.get('/faculty-performance', ...guard, getFacultyPerformance);
router.get('/student-performance', ...guard, getStudentPerformance);
router.get('/analytics', ...guard, getDepartmentAnalytics);
router.get('/assignment-stats', ...guard, getAssignmentStats);

module.exports = router;
