'use strict';

const service = require('../services/admin.service');
const apiResponse = require('../../../shared/utils/apiResponse');

/* ─────────────────────────────────────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────────────────────────────────────── */

const createUser = async (req, res, next) => {
  try {
    const { role, loginId, email, fullName, phone, password } = req.body;
    const user = await service.createUser({ role, loginId, email, fullName, phone, password });
    return apiResponse.created(res, user, 'User created successfully');
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { role, search, page, limit, isActive } = req.query;
    const { users, page: pg, limit: lmt, total } = await service.listUsers({ role, search, page, limit, isActive });
    return apiResponse.paginated(res, users, { page: pg, limit: lmt, total });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await service.getUserById(req.params.id);
    return apiResponse.success(res, user, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await service.updateUser(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return next(
        require('../../../shared/errors/AppError').badRequest(
          'newPassword must be at least 6 characters',
          'WEAK_PASSWORD'
        )
      );
    }
    const result = await service.resetUserPassword(req.params.id, newPassword, req.user._id);
    return apiResponse.success(res, result, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await service.deleteUser(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'User deactivated');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────────────────────────────────────── */

const getAllSettings = async (req, res, next) => {
  try {
    const settings = await service.getAllSettings();
    return apiResponse.success(res, settings, 'Settings retrieved');
  } catch (err) {
    next(err);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return next(
        require('../../../shared/errors/AppError').badRequest('value is required', 'MISSING_VALUE')
      );
    }
    const setting = await service.updateSetting(req.params.key, value, req.user._id);
    return apiResponse.success(res, setting, 'Setting updated');
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   ANALYTICS
───────────────────────────────────────────────────────────────────────────── */

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await service.getDashboardStats();
    return apiResponse.success(res, stats, 'Dashboard stats retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser,
  getAllSettings,
  updateSetting,
  getDashboardStats,
};
