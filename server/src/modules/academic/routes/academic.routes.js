'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/academic.controller');
const { validate } = require('../../../shared/validators/validate');
const {
  createAcademicYearValidator,
  createSemesterValidator,
  createSubjectValidator,
  assignFacultyValidator,
  enrollStudentsValidator,
  saveTimetableValidator,
} = require('../validators/academic.validator');

const adminOnly = [authenticate, authorize('admin')];

/* ── Academic Years ──────────────────────────────────────────────────────── */
router.post('/academic-years', ...adminOnly, createAcademicYearValidator, validate, ctrl.createAcademicYear);
router.get('/academic-years', ...adminOnly, ctrl.getAcademicYears);
router.patch('/academic-years/:id/current', ...adminOnly, ctrl.setCurrentAcademicYear);

/* ── Semesters ───────────────────────────────────────────────────────────── */
router.post('/semesters', ...adminOnly, createSemesterValidator, validate, ctrl.createSemester);
router.get('/semesters/current', authenticate, ctrl.getCurrentSemester);
router.get('/semesters', ...adminOnly, ctrl.getSemesters);
router.patch('/semesters/:id/current', ...adminOnly, ctrl.setCurrentSemester);

/* ── Subjects ────────────────────────────────────────────────────────────── */
router.post('/subjects', ...adminOnly, createSubjectValidator, validate, ctrl.createSubject);
router.get('/subjects', ...adminOnly, ctrl.getSubjectsBySemester);
router.patch('/subjects/:id', ...adminOnly, ctrl.updateSubject);
router.delete('/subjects/:id', ...adminOnly, ctrl.deleteSubject);

/* ── Faculty Assignments ─────────────────────────────────────────────────── */
router.post('/faculty-assignments', ...adminOnly, assignFacultyValidator, validate, ctrl.assignFaculty);
router.delete('/faculty-assignments/:id', ...adminOnly, ctrl.removeFaculty);
router.get('/faculty-assignments', ...adminOnly, ctrl.getFacultyMappings);

/* ── Enrollments ─────────────────────────────────────────────────────────── */
router.post('/enrollments', ...adminOnly, enrollStudentsValidator, validate, ctrl.enrollStudents);
router.delete('/enrollments/:id', ...adminOnly, ctrl.unenrollStudent);
router.get('/enrollments', ...adminOnly, ctrl.getSemesterStudents);

/* ── Timetable ───────────────────────────────────────────────────────────── */
router.post('/timetables', ...adminOnly, saveTimetableValidator, validate, ctrl.saveTimetable);
router.get('/timetables/student', authenticate, authorize('student'), ctrl.getStudentTimetable);
router.get('/timetables/faculty', authenticate, authorize('faculty', 'hod'), ctrl.getFacultyTimetable);
router.get('/timetables', authenticate, ctrl.getTimetable);

module.exports = router;
