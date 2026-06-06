'use strict';

const analyticsService = require('../services/analytics.service');
const { success } = require('../../../shared/utils/apiResponse');

const getPlatformAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getPlatformAnalytics();
    success(res, data, 'Platform analytics fetched');
  } catch (err) {
    next(err);
  }
};

const getSemesterAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getSemesterAnalytics(req.params.id);
    success(res, data, 'Semester analytics fetched');
  } catch (err) {
    next(err);
  }
};

const getSubjectAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getSubjectAnalytics(req.params.id, req.user._id);
    success(res, data, 'Subject analytics fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlatformAnalytics, getSemesterAnalytics, getSubjectAnalytics };
