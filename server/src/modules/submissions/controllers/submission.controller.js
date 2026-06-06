'use strict';

const submissionService = require('../services/submission.service');
const { success, created, paginated } = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');

const getUploadUrl = async (req, res, next) => {
  try {
    const { assignmentId, fileName, fileType } = req.query;
    if (!assignmentId || !fileName || !fileType) {
      throw AppError.badRequest('assignmentId, fileName, and fileType are required');
    }
    const result = await submissionService.generatePresignedUploadUrl(
      req.user._id,
      assignmentId,
      fileName,
      fileType,
    );
    return success(res, result, 'Upload URL generated');
  } catch (err) {
    next(err);
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, fileUrl, fileName, fileSize, extractedText } = req.body;
    const submission = await submissionService.submitAssignment({
      assignmentId,
      studentId: req.user._id,
      fileUrl,
      fileName,
      fileSize,
      extractedText,
    });
    return created(res, submission, 'Assignment submitted successfully');
  } catch (err) {
    next(err);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const { subjectId, status, page, limit } = req.query;
    const result = await submissionService.getStudentSubmissions(req.user._id, {
      subjectId,
      status,
      page,
      limit,
    });
    return paginated(res, result.submissions, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(
      req.params.id,
      req.user._id,
      req.user.role,
    );
    return success(res, submission);
  } catch (err) {
    next(err);
  }
};

const evaluateSubmission = async (req, res, next) => {
  try {
    const { status, marks, feedback, strengths, improvements } = req.body;
    const submission = await submissionService.evaluateSubmission(
      req.params.id,
      req.user._id,
      { status, marks, feedback, strengths, improvements },
    );
    return success(res, submission, 'Submission evaluated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUploadUrl,
  submitAssignment,
  getMySubmissions,
  getSubmissionById,
  evaluateSubmission,
};
