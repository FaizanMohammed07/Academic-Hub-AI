'use strict';

const studentService = require('../services/student.service');
const { success, paginated } = require('../../../shared/utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const data = await studentService.getStudentDashboard(req.user._id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const data = await studentService.getStudentSubjects(req.user._id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const { subjectId, status, page, limit } = req.query;
    const result = await studentService.getStudentAssignments(req.user._id, {
      subjectId,
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

const getStats = async (req, res, next) => {
  try {
    const stats = await studentService.getStudentStats(req.user._id);
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getSubjects,
  getAssignments,
  getStats,
};
