'use strict';

const Enrollment = require('../../academic/models/enrollment.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Assignment = require('../../assignments/models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const Notification = require('../../notifications/models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * getStudentDashboard
 */
const getStudentDashboard = async (studentId) => {
  // Current active enrollment
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true })
    .populate('semester', 'name number section isCurrent startDate endDate')
    .populate('academicYear', 'label startYear endYear')
    .lean();

  if (!enrollment) {
    return {
      enrollment: null,
      subjects: [],
      assignmentStats: { total: 0, pending: 0, submitted: 0, graded: 0, overdue: 0 },
      recentAssignments: [],
      recentSubmissions: [],
      unreadNotifications: 0,
    };
  }

  const semesterId = enrollment.semester._id;

  // Subjects for this semester via FacultySubjectMapping
  const mappings = await FacultySubjectMapping.find({ semester: semesterId, isActive: true })
    .populate('subject', 'name code type credits')
    .populate('faculty', USER_SELECT)
    .lean();

  const subjectIds = mappings.map((m) => m.subject._id);

  // All published assignments for these subjects in this semester
  const now = new Date();
  const allAssignments = await Assignment.find({
    subjectId: { $in: subjectIds },
    semesterId,
    status: 'published',
  })
    .sort({ createdAt: -1 })
    .lean();

  const assignmentIds = allAssignments.map((a) => a._id);

  // Student's submissions for these assignments
  const submissions = await Submission.find({
    assignmentId: { $in: assignmentIds },
    submittedBy: studentId,
  })
    .select('assignmentId status evaluation.marksAwarded')
    .lean();

  const submissionMap = {};
  submissions.forEach((s) => { submissionMap[s.assignmentId.toString()] = s; });

  // Compute assignment stats
  let pending = 0, submitted = 0, graded = 0, overdue = 0;
  allAssignments.forEach((a) => {
    const sub = submissionMap[a._id.toString()];
    if (sub) {
      if (['graded', 'approved'].includes(sub.status)) {
        graded += 1;
      } else {
        submitted += 1;
      }
    } else {
      const cutoff = new Date(a.deadline.getTime() + (a.gracePeriodMinutes || 0) * 60 * 1000);
      if (now > cutoff) {
        overdue += 1;
      } else {
        pending += 1;
      }
    }
  });

  // Unread notification count
  const unreadNotifications = await Notification.countDocuments({ recipient: studentId, isRead: false });

  // Recent submissions (last 5)
  const recentSubmissions = await Submission.find({ submittedBy: studentId })
    .sort({ submittedAt: -1 })
    .limit(5)
    .populate({ path: 'assignmentId', select: 'title type maxMarks subjectId', populate: { path: 'subjectId', select: 'name code' } })
    .lean();

  return {
    enrollment,
    subjects: mappings.map((m) => ({ ...m.subject, faculty: m.faculty })),
    assignmentStats: {
      total: allAssignments.length,
      pending,
      submitted,
      graded,
      overdue,
    },
    recentAssignments: allAssignments.slice(0, 5),
    recentSubmissions,
    unreadNotifications,
  };
};

/**
 * getStudentSubjects
 */
const getStudentSubjects = async (studentId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true })
    .populate('semester', 'name number section')
    .lean();

  if (!enrollment) throw AppError.notFound('No active enrollment found');

  const mappings = await FacultySubjectMapping.find({
    semester: enrollment.semester._id,
    isActive: true,
  })
    .populate('subject', 'name code type credits syllabus isActive')
    .populate('faculty', USER_SELECT)
    .lean();

  return {
    semester: enrollment.semester,
    subjects: mappings.map((m) => ({
      ...m.subject,
      faculty: m.faculty,
      mappingId: m._id,
    })),
  };
};

/**
 * getStudentAssignments
 */
const getStudentAssignments = async (studentId, { subjectId, status, page, limit } = {}) => {
  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });

  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true }).lean();
  if (!enrollment) throw AppError.notFound('No active enrollment found');

  // Get subject IDs student has access to
  const mappingFilter = { semester: enrollment.semester, isActive: true };
  if (subjectId) mappingFilter.subject = subjectId;

  const mappings = await FacultySubjectMapping.find(mappingFilter).select('subject').lean();
  const subjectIds = mappings.map((m) => m.subject);

  const assignmentFilter = {
    subjectId: { $in: subjectIds },
    semesterId: enrollment.semester,
    status: 'published',
  };

  const sort = buildSort({});
  const [assignments, total] = await Promise.all([
    Assignment.find(assignmentFilter)
      .sort(sort)
      .skip(skip)
      .limit(lmt)
      .populate('subjectId', 'name code type')
      .populate('createdBy', USER_SELECT)
      .lean(),
    Assignment.countDocuments(assignmentFilter),
  ]);

  // Attach student's submission status per assignment
  const assignmentIds = assignments.map((a) => a._id);
  const submissions = await Submission.find({
    assignmentId: { $in: assignmentIds },
    submittedBy: studentId,
  })
    .select('assignmentId status evaluation.marksAwarded submittedAt isLate')
    .lean();

  const subMap = {};
  submissions.forEach((s) => { subMap[s.assignmentId.toString()] = s; });

  const now = new Date();
  const result = assignments.map((a) => {
    const sub = subMap[a._id.toString()];
    const cutoff = new Date(a.deadline.getTime() + (a.gracePeriodMinutes || 0) * 60 * 1000);
    return {
      ...a,
      mySubmission: sub || null,
      submissionStatus: sub ? sub.status : now > cutoff ? 'overdue' : 'pending',
    };
  });

  // Apply status filter after enrichment if requested
  const filtered = status
    ? result.filter((a) => a.submissionStatus === status)
    : result;

  return { assignments: filtered, total, page: pg, limit: lmt };
};

/**
 * getStudentStats
 */
const getStudentStats = async (studentId) => {
  const submissions = await Submission.find({ submittedBy: studentId })
    .populate({ path: 'assignmentId', select: 'subjectId maxMarks', populate: { path: 'subjectId', select: 'name code' } })
    .lean();

  const total = submissions.length;
  const graded = submissions.filter((s) => s.status === 'graded').length;
  const approved = submissions.filter((s) => s.status === 'approved').length;
  const rejected = submissions.filter((s) => s.status === 'rejected').length;

  const gradedWithMarks = submissions.filter(
    (s) => s.evaluation && s.evaluation.marksAwarded !== undefined,
  );
  const totalMarks = gradedWithMarks.reduce((sum, s) => sum + (s.evaluation.marksAwarded || 0), 0);
  const averageMarks = gradedWithMarks.length > 0 ? totalMarks / gradedWithMarks.length : 0;

  // Per-subject breakdown
  const subjectMap = {};
  submissions.forEach((s) => {
    if (!s.assignmentId || !s.assignmentId.subjectId) return;
    const subjectId = s.assignmentId.subjectId._id.toString();
    if (!subjectMap[subjectId]) {
      subjectMap[subjectId] = {
        subject: s.assignmentId.subjectId,
        total: 0,
        graded: 0,
        approved: 0,
        rejected: 0,
        totalMarks: 0,
        totalMaxMarks: 0,
        count: 0,
      };
    }
    const entry = subjectMap[subjectId];
    entry.total += 1;
    if (s.status === 'graded') entry.graded += 1;
    if (s.status === 'approved') entry.approved += 1;
    if (s.status === 'rejected') entry.rejected += 1;
    if (s.evaluation && s.evaluation.marksAwarded !== undefined) {
      entry.totalMarks += s.evaluation.marksAwarded;
      entry.totalMaxMarks += s.assignmentId.maxMarks || 0;
      entry.count += 1;
    }
  });

  const perSubject = Object.values(subjectMap).map((e) => ({
    subject: e.subject,
    total: e.total,
    graded: e.graded,
    approved: e.approved,
    rejected: e.rejected,
    averageMarks: e.count > 0 ? e.totalMarks / e.count : 0,
    averagePercent: e.totalMaxMarks > 0 ? (e.totalMarks / e.totalMaxMarks) * 100 : 0,
  }));

  return {
    total,
    graded,
    approved,
    rejected,
    pending: total - graded - approved - rejected,
    averageMarks: Math.round(averageMarks * 100) / 100,
    perSubject,
  };
};

module.exports = {
  getStudentDashboard,
  getStudentSubjects,
  getStudentAssignments,
  getStudentStats,
};
