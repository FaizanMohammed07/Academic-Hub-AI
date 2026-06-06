const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../errors/AppError');
const User = require('../../modules/users/models/user.model');

const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw AppError.unauthorized();

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.accessSecret);

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user || !user.isActive) throw AppError.unauthorized('Account inactive');

  if (user.passwordChangedAt) {
    const changedTs = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedTs) throw AppError.unauthorized('Password changed. Please log in again');
  }

  req.user = user;
  next();
};

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw AppError.forbidden();
  next();
};

const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user?.isActive) req.user = user;
    }
  } catch (_) { /* ignore */ }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
