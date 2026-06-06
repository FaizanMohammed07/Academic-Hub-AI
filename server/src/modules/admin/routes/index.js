const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard — implementation pending' });
});

router.get('/users', (req, res) => {
  res.json({ success: true, message: 'User list — implementation pending' });
});

router.post('/users', (req, res) => {
  res.json({ success: true, message: 'User created — implementation pending' });
});

router.get('/semesters', (req, res) => {
  res.json({ success: true, message: 'Semesters — implementation pending' });
});

router.post('/semesters', (req, res) => {
  res.json({ success: true, message: 'Semester created — implementation pending' });
});

router.get('/subjects', (req, res) => {
  res.json({ success: true, message: 'Subjects — implementation pending' });
});

router.get('/audit-logs', (req, res) => {
  res.json({ success: true, message: 'Audit logs — implementation pending' });
});

router.get('/system/stats', (req, res) => {
  res.json({ success: true, data: { status: 'healthy', uptime: process.uptime() } });
});

router.get('/ai/config', (req, res) => {
  res.json({ success: true, message: 'AI config — implementation pending' });
});

module.exports = router;
