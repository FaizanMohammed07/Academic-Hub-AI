const router = require('express').Router();
const { authenticate } = require('../../../shared/middleware/auth.middleware');

router.use(authenticate);

// Routes for this module — full implementation in Phase 1 sprint
router.get('/', (req, res) => {
  res.json({ success: true, message: 'student.routes — implementation pending' });
});

module.exports = router;
