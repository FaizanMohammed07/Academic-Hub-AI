'use strict';

const Observation = require('../models/observation.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Notification = require('../../notifications/models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * createObservation
 */
const createObservation = async ({
  subject,
  faculty,
  semester,
  student,
  experimentNumber,
  experimentTitle,
  date,
  aim,
  procedure,
  result,
  inference,
  maxMarks,
  remarks,
}) => {
  // Verify faculty is mapped to this subject
  const mapping = await FacultySubjectMapping.findOne({ faculty, subject, semester, isActive: true });
  if (!mapping) {
    throw AppError.forbidden('You are not assigned to this subject for the selected semester');
  }

  // Verify student is enrolled
  const enrollment = await Enrollment.findOne({ student, semester, isActive: true });
  if (!enrollment) {
    throw AppError.badRequest('Student is not enrolled in this semester');
  }

  // No duplicate experiment number for same student + subject
  const duplicate = await Observation.findOne({ student, subject, experimentNumber });
  if (duplicate) {
    throw AppError.conflict(`Experiment #${experimentNumber} already exists for this student and subject`);
  }

  const observation = await Observation.create({
    subject,
    faculty,
    semester,
    student,
    experimentNumber,
    experimentTitle,
    date,
    aim,
    procedure,
    result,
    inference,
    maxMarks: maxMarks || 10,
    remarks,
    status: 'submitted',
    submittedAt: new Date(),
  });

  return observation;
};

/**
 * bulkCreateObservations
 */
const bulkCreateObservations = async ({ subject, faculty, semester, observations }) => {
  // Verify faculty mapping once
  const mapping = await FacultySubjectMapping.findOne({ faculty, subject, semester, isActive: true });
  if (!mapping) {
    throw AppError.forbidden('You are not assigned to this subject for the selected semester');
  }

  if (!Array.isArray(observations) || observations.length === 0) {
    throw AppError.badRequest('observations array is required and must not be empty');
  }

  // Validate all students are enrolled
  const studentIds = [...new Set(observations.map((o) => o.student.toString()))];
  const enrollments = await Enrollment.find({ student: { $in: studentIds }, semester, isActive: true }).select('student');
  const enrolledSet = new Set(enrollments.map((e) => e.student.toString()));

  const notEnrolled = studentIds.filter((id) => !enrolledSet.has(id));
  if (notEnrolled.length > 0) {
    throw AppError.badRequest(`Some students are not enrolled in this semester: ${notEnrolled.join(', ')}`);
  }

  // Check for duplicates within the batch and against DB
  const checks = observations.map((o) =>
    Observation.findOne({ student: o.student, subject, experimentNumber: o.experimentNumber }),
  );
  const existingResults = await Promise.all(checks);
  const conflicts = existingResults.filter(Boolean);
  if (conflicts.length > 0) {
    throw AppError.conflict(`${conflicts.length} duplicate experiment(s) already exist for this subject`);
  }

  const docs = observations.map((o) => ({
    subject,
    faculty,
    semester,
    student: o.student,
    experimentNumber: o.experimentNumber,
    experimentTitle: o.experimentTitle,
    date: o.date,
    aim: o.aim,
    procedure: o.procedure,
    result: o.result,
    inference: o.inference,
    maxMarks: o.maxMarks || 10,
    remarks: o.remarks,
    status: 'submitted',
    submittedAt: new Date(),
  }));

  const created = await Observation.insertMany(docs, { ordered: false });
  return created;
};

/**
 * getObservationsByFaculty
 */
const getObservationsByFaculty = async (facultyId, { subjectId, semesterId, page, limit } = {}) => {
  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });
  const filter = { faculty: facultyId };
  if (subjectId) filter.subject = subjectId;
  if (semesterId) filter.semester = semesterId;

  const sort = buildSort({ sortBy: 'date' });

  const [observations, total] = await Promise.all([
    Observation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lmt)
      .populate('student', USER_SELECT)
      .populate('subject', 'name code')
      .populate('semester', 'name number section')
      .lean(),
    Observation.countDocuments(filter),
  ]);

  return { observations, total, page: pg, limit: lmt };
};

/**
 * getObservationsByStudent
 */
const getObservationsByStudent = async (studentId, { subjectId, semesterId } = {}) => {
  const filter = { student: studentId };
  if (subjectId) filter.subject = subjectId;
  if (semesterId) filter.semester = semesterId;

  const observations = await Observation.find(filter)
    .sort({ experimentNumber: 1 })
    .populate('subject', 'name code')
    .populate('semester', 'name number section')
    .populate('faculty', USER_SELECT)
    .lean();

  return observations;
};

/**
 * evaluateObservation
 */
const evaluateObservation = async (observationId, facultyId, { marks, remarks }) => {
  const observation = await Observation.findById(observationId);
  if (!observation) throw AppError.notFound('Observation not found');

  if (observation.faculty.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this observation record');
  }

  if (marks !== undefined && marks > observation.maxMarks) {
    throw AppError.badRequest(`Marks cannot exceed maximum (${observation.maxMarks})`);
  }

  observation.marks = marks !== undefined ? marks : observation.marks;
  observation.remarks = remarks || observation.remarks;
  observation.status = 'evaluated';
  observation.evaluatedAt = new Date();
  await observation.save();

  // Notify student
  await Notification.create({
    recipient: observation.student,
    type: 'observation_evaluated',
    title: 'Observation Evaluated',
    message: `Experiment #${observation.experimentNumber} "${observation.experimentTitle}" has been evaluated. Marks: ${observation.marks}/${observation.maxMarks}.`,
    data: { observationId: observation._id, marks: observation.marks },
    relatedEntity: { entityType: 'Observation', entityId: observation._id },
  });

  return observation;
};

module.exports = {
  createObservation,
  bulkCreateObservations,
  getObservationsByFaculty,
  getObservationsByStudent,
  evaluateObservation,
};
