require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

const connectDB = require('./database/connection');
const { globalRateLimiter } = require('./shared/middleware/rateLimiter');
const { globalErrorHandler, notFoundHandler } = require('./shared/errors/errorHandler');
const logger = require('./shared/utils/logger');
const registerRoutes = require('./router');

const app = express();

// ── Security headers ────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL, 'https://vjit-it.ac.in'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Request parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Sanitization ────────────────────────────────────────────
app.use(mongoSanitize());
app.use(xssClean());

// ── Compression ─────────────────────────────────────────────
app.use(compression());

// ── HTTP logging ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Global rate limiter ─────────────────────────────────────
app.use('/api', globalRateLimiter);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ── API Routes (modular) ────────────────────────────────────
registerRoutes(app);

// ── 404 handler ─────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler ────────────────────────────────────
app.use(globalErrorHandler);

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`VJIT IT Hub API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();

module.exports = app;
