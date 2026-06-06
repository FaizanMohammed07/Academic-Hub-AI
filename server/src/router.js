'use strict';

const { authRateLimiter } = require('./shared/middleware/rateLimiter');

// Module routers
const authRoutes        = require('./modules/auth/routes/auth.routes');
const adminRoutes       = require('./modules/admin/routes');
const academicRoutes    = require('./modules/academic/routes/academic.routes');
const studentRoutes     = require('./modules/students/routes/student.routes');
const facultyRoutes     = require('./modules/faculty/routes/faculty.routes');
const hodRoutes         = require('./modules/hod/routes');
const assignmentRoutes  = require('./modules/assignments/routes/assignment.routes');
const submissionRoutes  = require('./modules/submissions/routes/submission.routes');
const observationRoutes = require('./modules/observations/routes/observation.routes');
const notificationRoutes = require('./modules/notifications/routes/notification.routes');
const noticeRoutes      = require('./modules/notices/routes/notice.routes');
const cmsRoutes         = require('./modules/cms/routes/cms.routes');
const aiRoutes          = require('./modules/ai/routes/ai.routes');
const vaultRoutes       = require('./modules/vault/routes/vault.routes');
const mediaRoutes       = require('./modules/media/routes/media.routes');
const settingsRoutes    = require('./modules/settings/routes/settings.routes');
const auditRoutes       = require('./modules/audit/routes/audit.routes');

// Optional modules (present in codebase — preserved)
const quizRoutes        = require('./modules/quizzes/routes/quiz.routes');
const analyticsRoutes   = require('./modules/analytics/routes/analytics.routes');
const timetableRoutes   = require('./modules/timetable/routes/timetable.routes');

const BASE = '/api/v1';

module.exports = (app) => {
  // Auth (rate-limited)
  app.use(`${BASE}/auth`,          authRateLimiter, authRoutes);

  // Role-based panels
  app.use(`${BASE}/admin`,         adminRoutes);
  app.use(`${BASE}/students`,      studentRoutes);
  app.use(`${BASE}/faculty`,       facultyRoutes);
  app.use(`${BASE}/hod`,           hodRoutes);

  // Academic core
  app.use(`${BASE}/academic`,      academicRoutes);
  app.use(`${BASE}/assignments`,   assignmentRoutes);
  app.use(`${BASE}/submissions`,   submissionRoutes);
  app.use(`${BASE}/observations`,  observationRoutes);

  // Communication & content
  app.use(`${BASE}/notifications`, notificationRoutes);
  app.use(`${BASE}/notices`,       noticeRoutes);
  app.use(`${BASE}/cms`,           cmsRoutes);

  // AI & Vault
  app.use(`${BASE}/ai`,            aiRoutes);
  app.use(`${BASE}/vault`,         vaultRoutes);

  // Media (S3 presigned uploads)
  app.use(`${BASE}/media`,         mediaRoutes);

  // Platform config
  app.use(`${BASE}/settings`,      settingsRoutes);
  app.use(`${BASE}/audit`,         auditRoutes);

  // Optional / extended modules
  app.use(`${BASE}/quizzes`,       quizRoutes);
  app.use(`${BASE}/analytics`,     analyticsRoutes);
  app.use(`${BASE}/timetable`,     timetableRoutes);
};
