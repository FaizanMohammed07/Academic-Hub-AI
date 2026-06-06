'use strict';

const AcademicYear = require('../models/academicYear.model');
const Semester = require('../models/semester.model');
const Subject = require('../models/subject.model');
const FacultySubjectMapping = require('../models/facultySubjectMapping.model');
const Enrollment = require('../models/enrollment.model');
const Timetable = require('../../timetable/models/timetable.model');
const User = require('../../users/models/user.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');
const mongoose = require('mongoose');

const FACULTY_SELECT = 'fullName email loginId avatarUrl role';

/* ─────────────────────────────────────────────────────────────────────────────
   ACADEMIC YEAR
───────────────────────────────────────────────────────────────────────────── */

async function createAcademicYear({ name, startDate, endDate, createdBy }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw AppError.badRequest('endDate must be after startDate', 'INVALID_DATE_RANGE');
  }

  // Check date overlap with existing active academic years
  const overlap = await AcademicYear.findOne({
    status: 'active',
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (overlap) {
    throw AppError.conflict(
      `Date range overlaps with existing academic year "${overlap.name}"`,
      'ACADEMIC_YEAR_OVERLAP'
    );
  }

  const year = await AcademicYear.create({ name, startDate: start, endDate: end, createdBy });
  return year;
}

async function setCurrentAcademicYear(yearId) {
  const year = await AcademicYear.findById(yearId);
  if (!year) throw AppError.notFound('Academic year not found');

  await AcademicYear.updateMany({ _id: { $ne: yearId } }, { $set: { isCurrent: false } });
  year.isCurrent = true;
  await year.save();
  return year;
}

async function getAcademicYears() {
  const years = await AcademicYear.aggregate([
    {
      $lookup: {
        from: 'semesters',
        localField: '_id',
        foreignField: 'academicYear',
        as: 'semesters',
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: 'academicYear',
        as: 'subjects',
      },
    },
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'academicYear',
        as: 'enrollments',
      },
    },
    {
      $addFields: {
        semesterCount: { $size: '$semesters' },
        subjectCount: { $size: '$subjects' },
        studentCount: {
          $size: {
            $filter: {
              input: '$enrollments',
              as: 'e',
              cond: { $eq: ['$$e.isActive', true] },
            },
          },
        },
      },
    },
    {
      $project: {
        semesters: 0,
        subjects: 0,
        enrollments: 0,
      },
    },
    { $sort: { startDate: -1 } },
  ]);
  return years;
}

async function getCurrentAcademicYear() {
  const year = await AcademicYear.findOne({ isCurrent: true });
  if (!year) throw AppError.notFound('No current academic year set');
  return year;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SEMESTER
───────────────────────────────────────────────────────────────────────────── */

async function createSemester({ academicYear, number, name, section, startDate, endDate, createdBy }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw AppError.badRequest('endDate must be after startDate', 'INVALID_DATE_RANGE');
  }

  const year = await AcademicYear.findById(academicYear);
  if (!year) throw AppError.notFound('Academic year not found');

  // Check duplicate number + section in same year
  const duplicate = await Semester.findOne({ academicYear, number, section: section || null });
  if (duplicate) {
    throw AppError.conflict(
      `Semester ${number}${section ? ` section ${section}` : ''} already exists for this academic year`,
      'SEMESTER_DUPLICATE'
    );
  }

  const semester = await Semester.create({
    academicYear,
    number,
    name,
    section: section || undefined,
    startDate: start,
    endDate: end,
    createdBy,
  });
  return semester;
}

async function getSemestersByYear(academicYearId) {
  const semesters = await Semester.aggregate([
    { $match: { academicYear: new mongoose.Types.ObjectId(academicYearId) } },
    {
      $lookup: {
        from: 'enrollments',
        let: { semId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$semester', '$$semId'] }, { $eq: ['$isActive', true] }] } } },
        ],
        as: 'enrollments',
      },
    },
    {
      $addFields: {
        enrollmentCount: { $size: '$enrollments' },
      },
    },
    { $project: { enrollments: 0 } },
    { $sort: { number: 1, section: 1 } },
  ]);
  return semesters;
}

async function setCurrentSemester(semesterId) {
  const semester = await Semester.findById(semesterId);
  if (!semester) throw AppError.notFound('Semester not found');

  // Unset current within the same academic year
  await Semester.updateMany(
    { academicYear: semester.academicYear, _id: { $ne: semesterId } },
    { $set: { isCurrent: false } }
  );
  semester.isCurrent = true;
  await semester.save();
  return semester;
}

async function getCurrentSemester() {
  const semester = await Semester.findOne({ isCurrent: true }).populate('academicYear');
  if (!semester) throw AppError.notFound('No current semester set');
  return semester;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUBJECT
───────────────────────────────────────────────────────────────────────────── */

async function createSubject({ code, name, credits, type, semester, academicYear, createdBy }) {
  const semDoc = await Semester.findById(semester);
  if (!semDoc) throw AppError.notFound('Semester not found');

  const yearDoc = await AcademicYear.findById(academicYear);
  if (!yearDoc) throw AppError.notFound('Academic year not found');

  // Code uniqueness is enforced by the model index, but provide a nicer error
  const existing = await Subject.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw AppError.conflict(`Subject with code "${code.toUpperCase()}" already exists`, 'SUBJECT_CODE_DUPLICATE');
  }

  const subject = await Subject.create({ code, name, credits, type, semester, academicYear, createdBy });
  return subject;
}

async function getSubjectsBySemester(semesterId) {
  const subjects = await Subject.aggregate([
    {
      $match: {
        semester: new mongoose.Types.ObjectId(semesterId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: 'facultysubjectmappings',
        let: { subId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$subject', '$$subId'] }, { $eq: ['$isActive', true] }] } } },
          {
            $lookup: {
              from: 'users',
              localField: 'faculty',
              foreignField: '_id',
              pipeline: [{ $project: { fullName: 1, email: 1, loginId: 1, avatarUrl: 1, role: 1 } }],
              as: 'facultyInfo',
            },
          },
          { $unwind: { path: '$facultyInfo', preserveNullAndEmpty: true } },
          { $project: { _id: 1, faculty: '$facultyInfo', assignedAt: 1 } },
        ],
        as: 'facultyMappings',
      },
    },
    { $sort: { code: 1 } },
  ]);
  return subjects;
}

async function updateSubject(subjectId, updates, updatedBy) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw AppError.notFound('Subject not found');

  const allowed = ['name', 'credits', 'type', 'syllabus', 'isActive'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) subject[key] = updates[key];
  });

  // Track who updated — store in a generic field if available, or just save
  await subject.save();
  return subject;
}

async function deleteSubject(subjectId) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw AppError.notFound('Subject not found');

  // Check for active faculty assignments
  const activeAssignment = await FacultySubjectMapping.findOne({ subject: subjectId, isActive: true });
  if (activeAssignment) {
    throw AppError.conflict(
      'Cannot delete subject with active faculty assignments. Remove assignments first.',
      'SUBJECT_HAS_ASSIGNMENTS'
    );
  }

  // Soft delete
  subject.isActive = false;
  await subject.save();
  return { deleted: true };
}

/* ─────────────────────────────────────────────────────────────────────────────
   FACULTY-SUBJECT MAPPING
───────────────────────────────────────────────────────────────────────────── */

async function assignFacultyToSubject({ faculty, subject, semester, academicYear, assignedBy }) {
  // Validate faculty role
  const facultyUser = await User.findById(faculty).select('role isActive');
  if (!facultyUser) throw AppError.notFound('Faculty user not found');
  if (!['faculty', 'hod'].includes(facultyUser.role)) {
    throw AppError.badRequest('User is not a faculty or HOD', 'INVALID_FACULTY_ROLE');
  }
  if (!facultyUser.isActive) {
    throw AppError.badRequest('Faculty account is inactive', 'FACULTY_INACTIVE');
  }

  // Validate subject belongs to the given semester
  const subjectDoc = await Subject.findById(subject).select('semester isActive');
  if (!subjectDoc) throw AppError.notFound('Subject not found');
  if (!subjectDoc.isActive) throw AppError.badRequest('Subject is not active', 'SUBJECT_INACTIVE');
  if (subjectDoc.semester.toString() !== semester.toString()) {
    throw AppError.badRequest('Subject does not belong to the specified semester', 'SUBJECT_SEMESTER_MISMATCH');
  }

  // Check for existing active mapping
  const existing = await FacultySubjectMapping.findOne({ faculty, subject, semester, isActive: true });
  if (existing) {
    throw AppError.conflict(
      'Faculty is already assigned to this subject for the given semester',
      'MAPPING_ALREADY_EXISTS'
    );
  }

  const mapping = await FacultySubjectMapping.create({
    faculty,
    subject,
    semester,
    academicYear,
    assignedBy,
  });

  return mapping.populate([
    { path: 'faculty', select: FACULTY_SELECT },
    { path: 'subject', select: 'code name credits type' },
  ]);
}

async function removeFacultyFromSubject(mappingId, removedBy) {
  const mapping = await FacultySubjectMapping.findById(mappingId);
  if (!mapping) throw AppError.notFound('Faculty assignment not found');
  if (!mapping.isActive) throw AppError.badRequest('Assignment is already inactive', 'MAPPING_INACTIVE');

  mapping.isActive = false;
  await mapping.save();
  return { removed: true, mappingId };
}

async function getFacultyMappings(semesterId) {
  const mappings = await FacultySubjectMapping.find({ semester: semesterId, isActive: true })
    .populate('faculty', FACULTY_SELECT)
    .populate('subject', 'code name credits type')
    .lean();

  // Group by subject
  const grouped = {};
  for (const m of mappings) {
    const subId = m.subject._id.toString();
    if (!grouped[subId]) {
      grouped[subId] = {
        subject: m.subject,
        faculty: [],
      };
    }
    grouped[subId].faculty.push({
      mappingId: m._id,
      faculty: m.faculty,
      assignedAt: m.assignedAt,
      assignedBy: m.assignedBy,
    });
  }
  return Object.values(grouped);
}

async function getFacultySubjects(facultyId, semesterId) {
  const query = { faculty: facultyId, isActive: true };
  if (semesterId) query.semester = semesterId;

  const mappings = await FacultySubjectMapping.find(query)
    .populate('subject', 'code name credits type syllabus')
    .populate('semester', 'number name section')
    .populate('academicYear', 'name')
    .lean();

  return mappings;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STUDENT ENROLLMENT
───────────────────────────────────────────────────────────────────────────── */

async function enrollStudents(studentIds, semesterId, enrolledBy) {
  const semester = await Semester.findById(semesterId);
  if (!semester) throw AppError.notFound('Semester not found');

  // Validate all studentIds are actual students
  const students = await User.find({
    _id: { $in: studentIds },
    role: 'student',
    isActive: true,
  }).select('_id loginId');

  if (students.length === 0) {
    throw AppError.badRequest('No valid active students found in the provided IDs', 'NO_VALID_STUDENTS');
  }

  const validStudentIds = students.map((s) => s._id.toString());

  // Find already-enrolled students for this semester
  const existing = await Enrollment.find({
    student: { $in: validStudentIds },
    semester: semesterId,
    isActive: true,
  }).select('student');

  const alreadyEnrolledSet = new Set(existing.map((e) => e.student.toString()));
  const toEnroll = students.filter((s) => !alreadyEnrolledSet.has(s._id.toString()));

  if (toEnroll.length === 0) {
    return { enrolled: 0, skipped: alreadyEnrolledSet.size, message: 'All students already enrolled' };
  }

  const enrollmentDocs = toEnroll.map((s) => ({
    student: s._id,
    semester: semesterId,
    academicYear: semester.academicYear,
    rollNumber: s.loginId, // use loginId as rollNumber
    enrolledBy,
  }));

  await Enrollment.insertMany(enrollmentDocs, { ordered: false });

  // Update semester.studentCount
  const totalActive = await Enrollment.countDocuments({ semester: semesterId, isActive: true });
  await Semester.findByIdAndUpdate(semesterId, { studentCount: totalActive });

  return {
    enrolled: toEnroll.length,
    skipped: alreadyEnrolledSet.size,
    message: `${toEnroll.length} student(s) enrolled successfully`,
  };
}

async function unenrollStudent(enrollmentId, removedBy) {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw AppError.notFound('Enrollment not found');
  if (!enrollment.isActive) throw AppError.badRequest('Student is already unenrolled', 'ALREADY_UNENROLLED');

  enrollment.isActive = false;
  await enrollment.save();

  // Update semester.studentCount
  const totalActive = await Enrollment.countDocuments({ semester: enrollment.semester, isActive: true });
  await Semester.findByIdAndUpdate(enrollment.semester, { studentCount: totalActive });

  return { unenrolled: true, enrollmentId };
}

async function getEnrollmentsBySemester(semesterId, query = {}) {
  const { page, limit, skip } = getPagination(query);

  const filter = { semester: semesterId, isActive: true };

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('student', FACULTY_SELECT)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  return { enrollments, page, limit, total };
}

async function getStudentEnrollment(studentId) {
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true })
    .populate('semester')
    .populate('academicYear')
    .lean();

  if (!enrollment) throw AppError.notFound('No active enrollment found for student');
  return enrollment;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TIMETABLE
───────────────────────────────────────────────────────────────────────────── */

async function saveTimetable({ semester, academicYear, section, effectiveFrom, slots, createdBy }) {
  const semDoc = await Semester.findById(semester);
  if (!semDoc) throw AppError.notFound('Semester not found');

  // Deactivate existing active timetable for same semester + section
  await Timetable.updateMany(
    { semester, section: section || null, isActive: true },
    { $set: { isActive: false } }
  );

  const timetable = await Timetable.create({
    semester,
    academicYear,
    section: section || undefined,
    effectiveFrom: new Date(effectiveFrom),
    slots,
    createdBy,
  });

  return timetable;
}

async function getTimetable(semesterId, section) {
  const query = { semester: semesterId, isActive: true };
  if (section) query.section = section;

  const timetable = await Timetable.findOne(query)
    .populate('semester', 'number name section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'code name type')
    .populate('slots.faculty', FACULTY_SELECT)
    .lean();

  if (!timetable) throw AppError.notFound('No active timetable found');
  return timetable;
}

async function getTimetableForStudent(studentId) {
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true })
    .populate('semester')
    .lean();

  if (!enrollment) throw AppError.notFound('No active enrollment found for student');

  const timetable = await Timetable.findOne({
    semester: enrollment.semester._id,
    section: enrollment.semester.section || undefined,
    isActive: true,
  })
    .populate('semester', 'number name section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'code name type')
    .populate('slots.faculty', FACULTY_SELECT)
    .lean();

  if (!timetable) throw AppError.notFound('No timetable found for your semester');
  return timetable;
}

async function getTimetableForFaculty(facultyId) {
  // Find all active timetables that have at least one slot for this faculty
  const timetables = await Timetable.find({
    isActive: true,
    'slots.faculty': facultyId,
  })
    .populate('semester', 'number name section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'code name type')
    .populate('slots.faculty', FACULTY_SELECT)
    .lean();

  // Filter slots to only the ones belonging to this faculty
  const result = timetables.map((tt) => ({
    ...tt,
    slots: tt.slots.filter((s) => s.faculty && s.faculty._id.toString() === facultyId.toString()),
  }));

  return result;
}

module.exports = {
  // Academic Year
  createAcademicYear,
  setCurrentAcademicYear,
  getAcademicYears,
  getCurrentAcademicYear,
  // Semester
  createSemester,
  getSemestersByYear,
  setCurrentSemester,
  getCurrentSemester,
  // Subject
  createSubject,
  getSubjectsBySemester,
  updateSubject,
  deleteSubject,
  // Faculty-Subject Mapping
  assignFacultyToSubject,
  removeFacultyFromSubject,
  getFacultyMappings,
  getFacultySubjects,
  // Enrollment
  enrollStudents,
  unenrollStudent,
  getEnrollmentsBySemester,
  getStudentEnrollment,
  // Timetable
  saveTimetable,
  getTimetable,
  getTimetableForStudent,
  getTimetableForFaculty,
};
