const authService = require('../services/auth.service');
const { success } = require('../../../shared/utils/apiResponse');
const { logAudit } = require('../../../shared/middleware/audit.middleware');

const login = async (req, res) => {
  const result = await authService.login(req.body);
  req.auditMeta = { action: 'auth.login', resource: 'users' };
  await logAudit(req, { resourceId: result.user.id, details: { role: result.user.role } });
  success(res, result, 'Login successful');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  success(res, tokens, 'Token refreshed');
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  req.auditMeta = { action: 'auth.logout', resource: 'users' };
  await logAudit(req, { resourceId: req.user._id });
  success(res, null, 'Logged out successfully');
};

const forgotPassword = async (req, res) => {
  await authService.sendPasswordReset(req.body.email);
  success(res, null, 'If that email exists, a reset OTP was sent.');
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.body);
  success(res, null, 'Password reset successfully');
};

const getMe = (req, res) => {
  success(res, req.user, 'Profile fetched');
};

const updateProfile = async (req, res) => {
  const User = require('../../users/models/user.model');
  const { fullName, phone, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullName, phone, avatarUrl },
    { new: true, runValidators: true }
  ).select('-passwordHash');
  success(res, user, 'Profile updated');
};

module.exports = { login, refresh, logout, forgotPassword, resetPassword, getMe, updateProfile };
