class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, code) { return new AppError(msg, 400, code); }
  static unauthorized(msg = 'Unauthorized') { return new AppError(msg, 401, 'UNAUTHORIZED'); }
  static forbidden(msg = 'Access denied') { return new AppError(msg, 403, 'FORBIDDEN'); }
  static notFound(msg = 'Resource not found') { return new AppError(msg, 404, 'NOT_FOUND'); }
  static conflict(msg, code) { return new AppError(msg, 409, code); }
  static tooMany(msg = 'Too many requests') { return new AppError(msg, 429, 'RATE_LIMITED'); }
  static internal(msg = 'Internal server error') { return new AppError(msg, 500, 'INTERNAL'); }
}

module.exports = AppError;
