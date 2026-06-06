'use strict';

const Assignment = require('../models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Notification = require('../../notifications/models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * createAssignment
 */
const createAssignment = async ({
  title,
  description,
  subject,
  faculty,
  semester,
  type,
  dueDate,
  maxMarks,
  instructions,
  topicSets,
  rubric,
  createdBy,
}) => {
  // Verify faculty is actively mapped to this subject for the given semester
  const mapping = await FacultySubjectMapping.findOne({
    faculty,
    subject,
    semester,
    isActive: true,
  });
  if (!mapping) {
    throw AppError.forbidden('You are not assigned to this subject for the selected semester');
  }

  const assignment = await Assignment.create({
    title,
    description,
    subjectId: subject,
    semesterId: semester,
    createdBy,
    type,
    deadline: dueDate,
    maxMarks,
    instructions,
    rubric: rubric || [],
    // topicSets stored in attachmentUrls is not the right field;
    // the model does not have a topicSets field — we store them as metadata via instructions
    // Anti-copy topic sets are handled by the AI/anti-copy engine at submission time
    antiCopyEnabled: Array.isArray(topicSets) && topicSets.length > 0,
    status: 'draft',
  });

  // Bulk notify enrolled students
  const enrollments = await Enrollment.find({ semester, isActive: true }).select('student');
  if (enrollments.length > 0) {
    const notifications = enrollments.map((e) => ({
      recipient: e.student,
      type: 'assignment_created',
      title: `New Assignment: ${title}`,
      message: `A new assignment "${title}" has been created. Due: ${new Date(dueDate).toLocaleDateString()}.`,
      data: { assignmentId: assignment._id },
      relatedEntity: { entityType: 'Assignment', entityId: assignment._id },
    }));
    await Notification.insertMany(notifications, { ordered: false });
  }

  return assignment;
};

/**
 * getAssignmentsByFaculty
 */
const getAssignmentsByFaculty = async (facultyId, { semesterId, status, page, limit } = {}) => {
  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });
  const filter = { createdBy: facultyId };
  if (semesterId) filter.semesterId = semesterId;
  if (status) filter.status = status;

  const sort = buildSort({});

  const [assignments, total] = await Promise.all([
    Assignment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lmt)
      .populate('subjectId', 'name code type')
      .populate('semesterId', 'name number section')
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  // Attach submission count per assignment
  const assignmentIds = assignments.map((a) => a._id);
  const submissionCounts = await Submission.aggregate([
    { $match: { assignmentId: { $in: assignmentIds } } },
    { $group: { _id: '$assignmentId', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  submissionCounts.forEach((sc) => { countMap[sc._id.toString()] = sc.count; });
  assignments.forEach((a) => { a.submissionCount = countMap[a._id.toString()] || 0; });

  return { assignments, total, page: pg, limit: lmt };
};

/**
 * getAssignmentsBySubject
 */
const getAssignmentsBySubject = async (subjectId, facultyId) => {
  // Faculty must own this subject
  const mapping = await FacultySubjectMapping.findOne({ faculty: facultyId, subject: subjectId, isActive: true });
  if (!mapping) {
    throw AppError.forbidden('You are not assigned to this subject');
  }

  const assignments = await Assignment.find({ subjectId })
    .sort({ createdAt: -1 })
    .populate('semesterId', 'name number section')
    .lean();

  return assignments;
};

/**
 * getAssignmentById
 */
const getAssignmentById = async (assignmentId, requesterId, requesterRole) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('subjectId', 'name code type')
    .populate('semesterId', 'name number section')
    .populate('createdBy', USER_SELECT)
    .lean();

  if (!assignment) throw AppError.notFound('Assignment not found');

  if (requesterRole === 'faculty' || requesterRole === 'hod') {
    // Full details + submission stats
    const [submissionCount, statusBreakdown] = await Promise.all([
      Submission.countDocuments({ assignmentId }),
      Submission.aggregate([
        { $match: { assignmentId: assignment._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const stats = { total: submissionCount };
    statusBreakdown.forEach((s) => { stats[s._id] = s.count; });
    return { assignment, stats };
  }

  if (requesterRole === 'student') {
    // Return assignment + student's own submission if exists
    const submission = await Submission.findOne({
      assignmentId,
      submittedBy: requesterId,
    })
      .populate('aiAnalysisId', 'status scores')
      .lean();

    return {
      assignment,
      submission: submission || null,
      studentTopic: submission ? submission.studentTopic : null,
      studentQuestions: submission ? submission.studentQuestions : [],
    };
  }

  return { assignment };
};

/**
 * updateAssignment
 */
const updateAssignment = async (assignmentId, updates, facultyId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.createdBy.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this assignment');
  }
  if (assignment.status === 'closed') {
    throw AppError.badRequest('Cannot update a closed assignment');
  }
  if (assignment.status === 'published' && new Date() > assignment.deadline) {
    throw AppError.badRequest('Cannot update an assignment past its due date');
  }

  // Prevent changing subject or semester
  const { subjectId, semesterId, subject, semester, ...safeUpdates } = updates;

  const allowed = ['title', 'description', 'deadline', 'maxMarks', 'instructions', 'rubric', 'gracePeriodMinutes', 'allowResubmission', 'sections'];
  Object.keys(safeUpdates).forEach((key) => {
    if (allowed.includes(key)) {
      assignment[key] = safeUpdates[key];
    }
  });
  // Map dueDate → deadline if passed
  if (safeUpdates.dueDate) assignment.deadline = safeUpdates.dueDate;

  await assignment.save();
  return assignment;
};

/**
 * deleteAssignment
 */
const deleteAssignment = async (assignmentId, facultyId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.createdBy.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this assignment');
  }

  const submissionExists = await Submission.exists({ assignmentId });
  if (submissionExists) {
    throw AppError.conflict('Cannot delete an assignment that already has submissions');
  }

  await assignment.deleteOne();
  return true;
};

/**
 * publishAssignment
 */
const publishAssignment = async (assignmentId, facultyId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.createdBy.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this assignment');
  }
  if (assignment.status === 'published') {
    throw AppError.conflict('Assignment is already published');
  }
  if (assignment.status === 'closed') {
    throw AppError.badRequest('Cannot publish a closed assignment');
  }

  assignment.status = 'published';
  assignment.publishedAt = new Date();
  await assignment.save();

  // Notify all enrolled students
  const enrollments = await Enrollment.find({ semester: assignment.semesterId, isActive: true }).select('student');
  if (enrollments.length > 0) {
    const notifications = enrollments.map((e) => ({
      recipient: e.student,
      type: 'assignment_created',
      title: `Assignment Published: ${assignment.title}`,
      message: `The assignment "${assignment.title}" is now available. Due: ${assignment.deadline.toLocaleDateString()}.`,
      data: { assignmentId: assignment._id },
      relatedEntity: { entityType: 'Assignment', entityId: assignment._id },
    }));
    await Notification.insertMany(notifications, { ordered: false });
  }

  return assignment;
};

/**
 * getSubmissionsForAssignment
 */
const getSubmissionsForAssignment = async (assignmentId, facultyId, { page, limit, status } = {}) => {
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.createdBy.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this assignment');
  }

  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });
  const filter = { assignmentId };
  if (status) filter.status = status;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(lmt)
      .populate('submittedBy', USER_SELECT)
      .populate('aiAnalysisId', 'status scores')
      .lean(),
    Submission.countDocuments(filter),
  ]);

  return { submissions, total, page: pg, limit: lmt };
};

module.exports = {
  createAssignment,
  getAssignmentsByFaculty,
  getAssignmentsBySubject,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  getSubmissionsForAssignment,
};
