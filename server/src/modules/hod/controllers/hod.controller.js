'use strict';

const hodService = require('../services/hod.service');
const apiResponse = require('../../../shared/utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const data = await hodService.getDepartmentDashboard(req.user._id);
    return apiResponse.success(res, data, 'Dashboard data fetched');
  } catch (err) {
    next(err);
  }
};

const getFacultyPerformance = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const data = await hodService.getFacultyPerformance(semesterId || null);
    return apiResponse.success(res, data, 'Faculty performance fetched');
  } catch (err) {
    next(err);
  }
};

const getStudentPerformance = async (req, res, next) => {
  try {
    const { semesterId, subjectId } = req.query;
    const { students, page, limit, total } = await hodService.getStudentPerformance(
      semesterId || null,
      req.query
    );
    return apiResponse.paginated(res, students, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const data = await hodService.getDepartmentAnalytics(academicYearId || null);
    return apiResponse.success(res, data, 'Department analytics fetched');
  } catch (err) {
    next(err);
  }
};

const getAssignmentStats = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const data = await hodService.getAssignmentStats(semesterId || null);
    return apiResponse.success(res, data, 'Assignment stats fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getFacultyPerformance,
  getStudentPerformance,
  getDepartmentAnalytics,
  getAssignmentStats,
};
