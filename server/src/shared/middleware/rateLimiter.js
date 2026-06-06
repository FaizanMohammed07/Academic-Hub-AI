const rateLimit = require('express-rate-limit');
const config = require('../../config');

const makeHandler = (max, message) =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message, code: 'RATE_LIMITED' },
  });

const globalRateLimiter = makeHandler(config.rateLimit.max, 'Too many requests. Please slow down.');
const authRateLimiter   = makeHandler(config.rateLimit.authMax, 'Too many auth attempts. Try later.');
const aiRateLimiter     = makeHandler(config.rateLimit.aiMax, 'AI request limit reached. Try later.');

module.exports = { globalRateLimiter, authRateLimiter, aiRateLimiter };
