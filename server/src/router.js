const { authRateLimiter } = require('./shared/middleware/rateLimiter');

// Module routers
const authRoutes = require('./modules/auth/routes/auth.routes');
const studentRoutes = require('./modules/students/routes/student.routes');
const facultyRoutes = require('./modules/faculty/routes/faculty.routes');
const hodRoutes = require('./modules/hod/routes');
const adminRoutes = require('./modules/admin/routes');
const assignmentRoutes = require('./modules/assignments/routes/assignment.routes');
const submissionRoutes = require('./modules/submissions/routes/submission.routes');
const observationRoutes = require('./modules/observations/routes/observation.routes');
const quizRoutes = require('./modules/quizzes/routes/quiz.routes');
const aiRoutes = require('./modules/ai/routes/ai.routes');
const analyticsRoutes = require('./modules/analytics/routes/analytics.routes');
const notificationRoutes = require('./modules/notifications/routes/notification.routes');
const vaultRoutes = require('./modules/vault/routes/vault.routes');
const cmsRoutes = require('./modules/cms/routes/cms.routes');
const mediaRoutes = require('./modules/media/routes/media.routes');
const auditRoutes = require('./modules/audit/routes/audit.routes');
const timetableRoutes = require('./modules/timetable/routes/timetable.routes');

const BASE = '/api/v1';

module.exports = (app) => {
  app.use(`${BASE}/auth`,          authRateLimiter, authRoutes);
  app.use(`${BASE}/students`,      studentRoutes);
  app.use(`${BASE}/faculty`,       facultyRoutes);
  app.use(`${BASE}/hod`,           hodRoutes);
  app.use(`${BASE}/admin`,         adminRoutes);
  app.use(`${BASE}/assignments`,   assignmentRoutes);
  app.use(`${BASE}/submissions`,   submissionRoutes);
  app.use(`${BASE}/observations`,  observationRoutes);
  app.use(`${BASE}/quizzes`,       quizRoutes);
  app.use(`${BASE}/ai`,            aiRoutes);
  app.use(`${BASE}/analytics`,     analyticsRoutes);
  app.use(`${BASE}/notifications`, notificationRoutes);
  app.use(`${BASE}/vault`,         vaultRoutes);
  app.use(`${BASE}/cms`,           cmsRoutes);
  app.use(`${BASE}/media`,         mediaRoutes);
  app.use(`${BASE}/audit`,         auditRoutes);
  app.use(`${BASE}/timetable`,     timetableRoutes);
};
