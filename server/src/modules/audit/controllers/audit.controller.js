'use strict';

const AuditLog = require('../models/auditLog.model');
const { success, paginated } = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

/**
 * getLogs
 * Paginated audit log listing with optional filters: action, userId, from, to.
 */
const getLogs = async (req, res, next) => {
  try {
    const { action, userId, from, to, page, limit } = req.query;
    const { page: pg, limit: lmt, skip } = getPagination({ page, limit });

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(lmt)
        .populate('userId', 'fullName email loginId role')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    paginated(res, logs, { page: pg, limit: lmt, total });
  } catch (err) {
    next(err);
  }
};

/**
 * getLogById
 * Single audit log detail.
 */
const getLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('userId', 'fullName email loginId role')
      .lean();
    if (!log) throw AppError.notFound('Audit log not found');
    success(res, log, 'Audit log fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, getLogById };
