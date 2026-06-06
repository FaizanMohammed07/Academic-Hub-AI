'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const { getAllSettings, updateSetting } = require('../controllers/settings.controller');

router.get('/', authenticate, authorize('admin'), getAllSettings);
router.patch('/:key', authenticate, authorize('admin'), updateSetting);

module.exports = router;
