const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../../config');
const AppError = require('../../../shared/errors/AppError');
const User = require('../../users/models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const emailService = require('../../notifications/providers/email.provider');

const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({ userId, token, expiresAt });
};

const login = async ({ loginId, password, role }) => {
  const user = await User.findOne({ loginId, role }).select('+passwordHash');
  if (!user) throw AppError.unauthorized('Invalid credentials');
  if (!user.isActive) throw AppError.forbidden('Account deactivated. Contact Admin.');
  if (user.isLocked()) throw AppError.forbidden('Account locked. Try again in 15 minutes.');

  const match = await user.comparePassword(password);
  if (!match) {
    await user.incrementFailedAttempts();
    throw AppError.unauthorized('Invalid credentials');
  }

  await user.resetFailedAttempts();

  const accessToken  = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  await saveRefreshToken(user._id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      loginId: user.loginId,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
  };
};

const refreshAccessToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await RefreshToken.findOne({ token, isRevoked: false });
  if (!stored || stored.expiresAt < new Date()) throw AppError.unauthorized('Session expired');

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw AppError.unauthorized();

  // Rotate refresh token
  const newRefresh = signRefreshToken(user._id);
  stored.isRevoked   = true;
  stored.replacedBy  = newRefresh;
  await stored.save();
  await saveRefreshToken(user._id, newRefresh);

  const accessToken = signAccessToken(user._id, user.role);
  return { accessToken, refreshToken: newRefresh };
};

const logout = async (token) => {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
};

const sendPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // silent: don't reveal existence

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetOtp   = hash;
  user.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordReset(user.email, user.fullName, otp);
};

const resetPassword = async ({ email, otp, newPassword }) => {
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    email,
    passwordResetOtp: hash,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordHash');

  if (!user) throw AppError.badRequest('Invalid or expired OTP', 'INVALID_OTP');

  user.passwordHash       = newPassword;
  user.passwordResetOtp   = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
};

module.exports = { login, refreshAccessToken, logout, sendPasswordReset, resetPassword };
