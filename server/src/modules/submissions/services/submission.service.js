'use strict';

const Submission = require('../models/submission.model');
const Assignment = require('../../assignments/models/assignment.model');
const Enrollment = require('../../academic/models/enrollment.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Notification = require('../../notifications/models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const EventBus = require('../../../shared/events/EventBus');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * submitAssignment
 */
const submitAssignment = async ({ assignmentId, studentId, fileUrl, fileName, fileSize, extractedText }) => {
  // Load and validate assignment
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.status !== 'published') {
    throw AppError.badRequest('Assignment is not open for submission');
  }

  // Check deadline (with grace period)
  const cutoff = new Date(assignment.deadline.getTime() + assignment.gracePeriodMinutes * 60 * 1000);
  const isLate = new Date() > assignment.deadline;
  if (new Date() > cutoff) {
    throw AppError.badRequest('Submission deadline has passed');
  }

  // Verify student is enrolled in assignment's semester
  const enrollment = await Enrollment.findOne({ student: studentId, semester: assignment.semesterId, isActive: true });
  if (!enrollment) {
    throw AppError.forbidden('You are not enrolled in the semester for this assignment');
  }

  // Prevent duplicate submissions
  const existing = await Submission.findOne({ assignmentId, submittedBy: studentId });
  if (existing) {
    throw AppError.conflict('You have already submitted this assignment');
  }

  const submission = await Submission.create({
    assignmentId,
    studentId,
    submittedBy: studentId,
    fileUrls: fileUrl ? [fileUrl] : [],
    fileMetadata: fileName
      ? [{ originalName: fileName, sizeBytes: fileSize || 0 }]
      : [],
    extractedText: extractedText || undefined,
    status: 'submitted',
    submittedAt: new Date(),
    isLate,
  });

  // Emit event for AI processing
  EventBus.publish('submission.created', { submissionId: submission._id });

  // Notify faculty who owns the assignment
  const facultyMapping = await FacultySubjectMapping.findOne({
    subject: assignment.subjectId,
    semester: assignment.semesterId,
    isActive: true,
  });
  if (facultyMapping) {
    await Notification.create({
      recipient: facultyMapping.faculty,
      type: 'submission_received',
      title: 'New Submission Received',
      message: `A student has submitted for "${assignment.title}".`,
      data: { submissionId: submission._id, assignmentId },
      relatedEntity: { entityType: 'Submission', entityId: submission._id },
    });
  }

  return submission;
};

/**
 * getStudentSubmissions
 */
const getStudentSubmissions = async (studentId, { subjectId, status, page, limit } = {}) => {
  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });
  const filter = { submittedBy: studentId };
  if (status) filter.status = status;

  // If subjectId filter, find assignment IDs for that subject first
  if (subjectId) {
    const assignments = await Assignment.find({ subjectId }).select('_id').lean();
    filter.assignmentId = { $in: assignments.map((a) => a._id) };
  }

  const sort = buildSort({});

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lmt)
      .populate({
        path: 'assignmentId',
        select: 'title type deadline maxMarks status subjectId',
        populate: { path: 'subjectId', select: 'name code' },
      })
      .populate('aiAnalysisId', 'status scores')
      .lean(),
    Submission.countDocuments(filter),
  ]);

  return { submissions, total, page: pg, limit: lmt };
};

/**
 * getSubmissionById
 */
const getSubmissionById = async (submissionId, requesterId, requesterRole) => {
  const submission = await Submission.findById(submissionId)
    .populate('submittedBy', USER_SELECT)
    .populate({
      path: 'assignmentId',
      select: 'title type deadline maxMarks status subjectId createdBy semesterId',
      populate: { path: 'subjectId', select: 'name code' },
    })
    .populate('evaluation.evaluatedBy', USER_SELECT)
    .populate('aiAnalysisId', 'status scores details')
    .lean();

  if (!submission) throw AppError.notFound('Submission not found');

  if (requesterRole === 'student') {
    if (submission.submittedBy._id.toString() !== requesterId.toString()) {
      throw AppError.forbidden('You can only view your own submissions');
    }
    return submission;
  }

  if (requesterRole === 'faculty') {
    // Faculty must own the assignment
    const assignment = submission.assignmentId;
    if (!assignment || assignment.createdBy.toString() !== requesterId.toString()) {
      throw AppError.forbidden('You do not own this assignment');
    }
    return submission;
  }

  // HOD can see all
  return submission;
};

/**
 * evaluateSubmission
 */
const evaluateSubmission = async (submissionId, facultyId, { status, marks, feedback, strengths, improvements }) => {
  if (!['graded', 'rejected', 'resubmit_requested'].includes(status)) {
    throw AppError.badRequest('Status must be graded, rejected, or resubmit_requested');
  }

  const submission = await Submission.findById(submissionId)
    .populate('assignmentId', 'title createdBy maxMarks subjectId semesterId')
    .exec();
  if (!submission) throw AppError.notFound('Submission not found');

  const assignment = submission.assignmentId;
  if (!assignment || assignment.createdBy.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this assignment');
  }

  if (marks !== undefined && marks > assignment.maxMarks) {
    throw AppError.badRequest(`Marks cannot exceed maximum marks (${assignment.maxMarks})`);
  }

  submission.status = status;
  submission.evaluation = {
    evaluatedBy: facultyId,
    evaluatedAt: new Date(),
    marksAwarded: marks !== undefined ? marks : submission.evaluation?.marksAwarded,
    feedback: feedback || submission.evaluation?.feedback,
  };

  await submission.save();

  // Notify student
  await Notification.create({
    recipient: submission.submittedBy,
    type: 'submission_graded',
    title: `Assignment ${status === 'graded' ? 'Graded' : status === 'rejected' ? 'Rejected' : 'Needs Revision'}`,
    message: `Your submission for "${assignment.title}" has been ${status}.${marks !== undefined ? ` Marks: ${marks}/${assignment.maxMarks}.` : ''} ${feedback ? feedback : ''}`.trim(),
    data: { submissionId: submission._id, assignmentId: assignment._id, marks, status },
    relatedEntity: { entityType: 'Submission', entityId: submission._id },
  });

  return submission;
};

/**
 * generatePresignedUploadUrl
 */
const generatePresignedUploadUrl = async (studentId, assignmentId, fileName, fileType) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw AppError.notFound('Assignment not found');
  if (assignment.status !== 'published') {
    throw AppError.badRequest('Assignment is not open for submission');
  }

  const cutoff = new Date(assignment.deadline.getTime() + assignment.gracePeriodMinutes * 60 * 1000);
  if (new Date() > cutoff) {
    throw AppError.badRequest('Submission deadline has passed');
  }

  const enrollment = await Enrollment.findOne({ student: studentId, semester: assignment.semesterId, isActive: true });
  if (!enrollment) {
    throw AppError.forbidden('You are not enrolled in the semester for this assignment');
  }

  const existing = await Submission.findOne({ assignmentId, submittedBy: studentId });
  if (existing) {
    throw AppError.conflict('You have already submitted this assignment');
  }

  // Attempt to load S3 service — if not available, return a placeholder
  let uploadUrl, fileUrl;
  try {
    const s3Service = require('../../../media/services/s3.service');
    const s3Key = `submissions/${assignmentId}/${studentId}/${Date.now()}-${fileName}`;
    const result = await s3Service.getPresignedUploadUrl(s3Key, fileType);
    uploadUrl = result.uploadUrl;
    fileUrl = result.fileUrl;
  } catch (err) {
    throw AppError.internal('File upload service is not available');
  }

  return { uploadUrl, fileUrl, fileName, fileType };
};

module.exports = {
  submitAssignment,
  getStudentSubmissions,
  getSubmissionById,
  evaluateSubmission,
  generatePresignedUploadUrl,
};
