'use strict';

const facultyService = require('../services/faculty.service');
const { success } = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');

const getDashboard = async (req, res, next) => {
  try {
    const data = await facultyService.getFacultyDashboard(req.user._id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getMySubjects = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const data = await facultyService.getFacultySubjects(req.user._id, semesterId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      throw AppError.badRequest('subjectId query parameter is required');
    }
    const stats = await facultyService.getFacultyStats(req.user._id, subjectId);
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

const getSubjectStudents = async (req, res, next) => {
  try {
    const { id: subjectId } = req.params;
    const data = await facultyService.getSubjectStudents(req.user._id, subjectId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getMySubjects,
  getStats,
  getSubjectStudents,
};
