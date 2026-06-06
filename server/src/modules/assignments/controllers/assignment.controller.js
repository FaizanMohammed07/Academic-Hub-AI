'use strict';

const assignmentService = require('../services/assignment.service');
const { success, created, paginated } = require('../../../shared/utils/apiResponse');

const createAssignment = async (req, res, next) => {
  try {
    const {
      title, description, subject, semester, type,
      dueDate, maxMarks, instructions, topicSets, rubric,
    } = req.body;

    const assignment = await assignmentService.createAssignment({
      title,
      description,
      subject,
      faculty: req.user._id,
      semester,
      type,
      dueDate,
      maxMarks,
      instructions,
      topicSets,
      rubric,
      createdBy: req.user._id,
    });

    return created(res, assignment, 'Assignment created successfully');
  } catch (err) {
    next(err);
  }
};

const getMyAssignments = async (req, res, next) => {
  try {
    const { semesterId, status, page, limit } = req.query;
    const result = await assignmentService.getAssignmentsByFaculty(req.user._id, {
      semesterId,
      status,
      page,
      limit,
    });
    return paginated(res, result.assignments, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const getAssignmentsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const assignments = await assignmentService.getAssignmentsBySubject(subjectId, req.user._id);
    return success(res, assignments);
  } catch (err) {
    next(err);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const result = await assignmentService.getAssignmentById(
      req.params.id,
      req.user._id,
      req.user.role,
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(
      req.params.id,
      req.body,
      req.user._id,
    );
    return success(res, assignment, 'Assignment updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id, req.user._id);
    return success(res, null, 'Assignment deleted successfully');
  } catch (err) {
    next(err);
  }
};

const publishAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.publishAssignment(req.params.id, req.user._id);
    return success(res, assignment, 'Assignment published successfully');
  } catch (err) {
    next(err);
  }
};

const getSubmissions = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await assignmentService.getSubmissionsForAssignment(
      req.params.id,
      req.user._id,
      { page, limit, status },
    );
    return paginated(res, result.submissions, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAssignment,
  getMyAssignments,
  getAssignmentsBySubject,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  getSubmissions,
};
