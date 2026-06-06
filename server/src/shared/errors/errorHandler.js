const logger = require('../utils/logger');
const AppError = require('./AppError');

const sendError = (res, statusCode, message, code = null, errors = null) => {
  const body = { success: false, message, code };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const handleCastError = (err) =>
  AppError.badRequest(`Invalid ${err.path}: ${err.value}`, 'INVALID_ID');

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return AppError.conflict(`${field} already exists`, 'DUPLICATE_KEY');
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return { statusCode: 400, message: 'Validation failed', errors };
};

const handleJWTError = () => AppError.unauthorized('Invalid token');
const handleJWTExpired = () => AppError.unauthorized('Token expired');

const globalErrorHandler = (err, req, res, _next) => {
  let error = err;

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  if (err.name === 'ValidationError') {
    const { statusCode, message, errors } = handleValidationError(err);
    return sendError(res, statusCode, message, 'VALIDATION_ERROR', errors);
  }

  if (error.isOperational) {
    return sendError(res, error.statusCode, error.message, error.code);
  }

  logger.error(`Unhandled error: ${err.stack}`);
  return sendError(res, 500, 'Something went wrong', 'INTERNAL');
};

const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`, 'NOT_FOUND');
};

module.exports = { globalErrorHandler, notFoundHandler };
