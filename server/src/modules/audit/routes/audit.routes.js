'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/audit.controller');

router.get('/',    authenticate, authorize('admin'), ctrl.getLogs);
router.get('/:id', authenticate, authorize('admin'), ctrl.getLogById);

module.exports = router;
