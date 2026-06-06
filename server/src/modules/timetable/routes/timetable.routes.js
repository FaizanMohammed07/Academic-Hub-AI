'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/timetable.controller');

router.post('/',       authenticate, authorize('admin'), ctrl.saveTimetable);
router.get('/',        authenticate, authorize('admin', 'hod'), ctrl.getTimetable);
router.get('/student', authenticate, authorize('student'), ctrl.getStudentTimetable);
router.get('/faculty', authenticate, authorize('faculty', 'hod'), ctrl.getFacultyTimetable);

module.exports = router;
