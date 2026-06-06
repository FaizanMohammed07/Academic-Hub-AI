'use strict';

const service = require('../services/academic.service');
const apiResponse = require('../../../shared/utils/apiResponse');
const { getPagination } = require('../../../shared/utils/pagination');

/* ─────────────────────────────────────────────────────────────────────────────
   ACADEMIC YEAR
───────────────────────────────────────────────────────────────────────────── */

const createAcademicYear = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;
    const year = await service.createAcademicYear({ name, startDate, endDate, createdBy: req.user._id });
    return apiResponse.created(res, year, 'Academic year created');
  } catch (err) {
    next(err);
  }
};

const getAcademicYears = async (req, res, next) => {
  try {
    const years = await service.getAcademicYears();
    return apiResponse.success(res, years, 'Academic years retrieved');
  } catch (err) {
    next(err);
  }
};

const setCurrentAcademicYear = async (req, res, next) => {
  try {
    const year = await service.setCurrentAcademicYear(req.params.id);
    return apiResponse.success(res, year, 'Current academic year updated');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SEMESTER
───────────────────────────────────────────────────────────────────────────── */

const createSemester = async (req, res, next) => {
  try {
    const { academicYear, number, name, section, startDate, endDate } = req.body;
    const semester = await service.createSemester({
      academicYear,
      number,
      name,
      section,
      startDate,
      endDate,
      createdBy: req.user._id,
    });
    return apiResponse.created(res, semester, 'Semester created');
  } catch (err) {
    next(err);
  }
};

const getSemesters = async (req, res, next) => {
  try {
    const { yearId } = req.query;
    if (!yearId) {
      return next(require('../../../shared/errors/AppError').badRequest('yearId query param is required', 'MISSING_YEAR_ID'));
    }
    const semesters = await service.getSemestersByYear(yearId);
    return apiResponse.success(res, semesters, 'Semesters retrieved');
  } catch (err) {
    next(err);
  }
};

const setCurrentSemester = async (req, res, next) => {
  try {
    const semester = await service.setCurrentSemester(req.params.id);
    return apiResponse.success(res, semester, 'Current semester updated');
  } catch (err) {
    next(err);
  }
};

const getCurrentSemester = async (req, res, next) => {
  try {
    const semester = await service.getCurrentSemester();
    return apiResponse.success(res, semester, 'Current semester retrieved');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUBJECT
───────────────────────────────────────────────────────────────────────────── */

const createSubject = async (req, res, next) => {
  try {
    const { code, name, credits, type, semester, academicYear } = req.body;
    const subject = await service.createSubject({
      code,
      name,
      credits,
      type,
      semester,
      academicYear,
      createdBy: req.user._id,
    });
    return apiResponse.created(res, subject, 'Subject created');
  } catch (err) {
    next(err);
  }
};

const getSubjectsBySemester = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    if (!semesterId) {
      return next(require('../../../shared/errors/AppError').badRequest('semesterId query param is required', 'MISSING_SEMESTER_ID'));
    }
    const subjects = await service.getSubjectsBySemester(semesterId);
    return apiResponse.success(res, subjects, 'Subjects retrieved');
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await service.updateSubject(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, subject, 'Subject updated');
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const result = await service.deleteSubject(req.params.id);
    return apiResponse.success(res, result, 'Subject deleted');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   FACULTY MAPPING
───────────────────────────────────────────────────────────────────────────── */

const assignFaculty = async (req, res, next) => {
  try {
    const { faculty, subject, semester, academicYear } = req.body;
    const mapping = await service.assignFacultyToSubject({
      faculty,
      subject,
      semester,
      academicYear,
      assignedBy: req.user._id,
    });
    return apiResponse.created(res, mapping, 'Faculty assigned to subject');
  } catch (err) {
    next(err);
  }
};

const removeFaculty = async (req, res, next) => {
  try {
    const result = await service.removeFacultyFromSubject(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Faculty assignment removed');
  } catch (err) {
    next(err);
  }
};

const getFacultyMappings = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    if (!semesterId) {
      return next(require('../../../shared/errors/AppError').badRequest('semesterId query param is required', 'MISSING_SEMESTER_ID'));
    }
    const mappings = await service.getFacultyMappings(semesterId);
    return apiResponse.success(res, mappings, 'Faculty mappings retrieved');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   STUDENT ENROLLMENT
───────────────────────────────────────────────────────────────────────────── */

const enrollStudents = async (req, res, next) => {
  try {
    const { studentIds, semesterId } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return next(require('../../../shared/errors/AppError').badRequest('studentIds must be a non-empty array', 'INVALID_STUDENT_IDS'));
    }
    const result = await service.enrollStudents(studentIds, semesterId, req.user._id);
    return apiResponse.success(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

const unenrollStudent = async (req, res, next) => {
  try {
    const result = await service.unenrollStudent(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Student unenrolled');
  } catch (err) {
    next(err);
  }
};

const getSemesterStudents = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    if (!semesterId) {
      return next(require('../../../shared/errors/AppError').badRequest('semesterId query param is required', 'MISSING_SEMESTER_ID'));
    }
    const { enrollments, page, limit, total } = await service.getEnrollmentsBySemester(semesterId, req.query);
    return apiResponse.paginated(res, enrollments, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   TIMETABLE
───────────────────────────────────────────────────────────────────────────── */

const saveTimetable = async (req, res, next) => {
  try {
    const { semester, academicYear, section, effectiveFrom, slots } = req.body;
    const timetable = await service.saveTimetable({
      semester,
      academicYear,
      section,
      effectiveFrom,
      slots,
      createdBy: req.user._id,
    });
    return apiResponse.created(res, timetable, 'Timetable saved');
  } catch (err) {
    next(err);
  }
};

const getTimetable = async (req, res, next) => {
  try {
    const { semesterId, section } = req.query;
    if (!semesterId) {
      return next(require('../../../shared/errors/AppError').badRequest('semesterId query param is required', 'MISSING_SEMESTER_ID'));
    }
    const timetable = await service.getTimetable(semesterId, section);
    return apiResponse.success(res, timetable, 'Timetable retrieved');
  } catch (err) {
    next(err);
  }
};

const getStudentTimetable = async (req, res, next) => {
  try {
    const timetable = await service.getTimetableForStudent(req.user._id);
    return apiResponse.success(res, timetable, 'Timetable retrieved');
  } catch (err) {
    next(err);
  }
};

const getFacultyTimetable = async (req, res, next) => {
  try {
    const timetables = await service.getTimetableForFaculty(req.user._id);
    return apiResponse.success(res, timetables, 'Timetable retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  // Academic Year
  createAcademicYear,
  getAcademicYears,
  setCurrentAcademicYear,
  // Semester
  createSemester,
  getSemesters,
  setCurrentSemester,
  getCurrentSemester,
  // Subject
  createSubject,
  getSubjectsBySemester,
  updateSubject,
  deleteSubject,
  // Faculty Mapping
  assignFaculty,
  removeFaculty,
  getFacultyMappings,
  // Enrollment
  enrollStudents,
  unenrollStudent,
  getSemesterStudents,
  // Timetable
  saveTimetable,
  getTimetable,
  getStudentTimetable,
  getFacultyTimetable,
};
